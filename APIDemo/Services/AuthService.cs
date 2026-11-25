using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Repositories;
using APIDemo.Security;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;

namespace APIDemo.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
        }

        public async Task<(AuthResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiresAt)> RegisterAsync(
            UserRegisterDto dto,
            string? ipAddress = null)
        {
            var normalizedRole = ValidatePublicRegistrationRole(dto.Role);

            if (await _authRepository.ExistsByUsernameAsync(dto.Username.Trim()))
            {
                throw new ConflictException($"Tên đăng nhập '{dto.Username}' đã tồn tại trong hệ thống.");
            }

            if (await _authRepository.ExistsByEmailAsync(dto.Email.Trim().ToLowerInvariant()))
            {
                throw new ConflictException($"Email '{dto.Email}' đã được sử dụng.");
            }

            PasswordHasher.CreatePasswordHash(dto.Password, out var hash, out var salt);

            var user = new User
            {
                Username = dto.Username.Trim(),
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim().ToLowerInvariant(),
                PasswordHash = hash,
                PasswordSalt = salt,
                Phone = string.IsNullOrWhiteSpace(dto.Phone) ? "0912345678" : dto.Phone.Trim(),
                Role = normalizedRole,
                Department = "General",
                DateOfBirth = dto.DateOfBirth,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _authRepository.CreateUserAsync(user);

            var (token, expiresAt) = GenerateJwtToken(user);
            var (rawRefresh, refreshExpiresAt) = await IssueRefreshTokenAsync(user.Id, ipAddress);

            var response = BuildAuthResponse("Đăng ký tài khoản thành công!", token, expiresAt, user);
            return (response, rawRefresh, refreshExpiresAt);
        }

        public async Task<(AuthResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiresAt)?> LoginAsync(
            LoginDto dto,
            string? ipAddress = null)
        {
            var identifier = dto.Username.Trim();
            var user = await _authRepository.GetByUsernameAsync(identifier)
                ?? await _authRepository.GetByEmailAsync(identifier.ToLowerInvariant());
            if (user == null) return null;

            if (!user.IsActive)
            {
                throw new ForbiddenException("Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.");
            }

            if (!PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt, out var needsRehash))
            {
                return null;
            }

            // Tự động nâng cấp tài khoản seed HMACSHA512 cũ lên PBKDF2-HMAC-SHA512 sau khi đăng nhập thành công
            if (needsRehash)
            {
                PasswordHasher.CreatePasswordHash(dto.Password, out var newHash, out var newSalt);
                user.PasswordHash = newHash;
                user.PasswordSalt = newSalt;
                await _authRepository.UpdateUserAsync(user);
            }

            var (token, expiresAt) = GenerateJwtToken(user);
            var (rawRefresh, refreshExpiresAt) = await IssueRefreshTokenAsync(user.Id, ipAddress);

            var response = BuildAuthResponse("Đăng nhập thành công!", token, expiresAt, user);
            return (response, rawRefresh, refreshExpiresAt);
        }

        public async Task<(AuthResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiresAt)> RefreshAsync(
            string refreshToken,
            string? ipAddress = null)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new UnauthorizedException("Thiếu Refresh Token.");
            }

            var tokenHash = HashRefreshToken(refreshToken.Trim());
            var stored = await _authRepository.GetRefreshTokenByHashAsync(tokenHash);
            if (stored == null || stored.User == null)
            {
                throw new UnauthorizedException("Refresh Token không hợp lệ.");
            }

            // Phát hiện reuse attack: token đã bị thu hồi trước đó -> thu hồi toàn bộ phiên của user
            if (stored.IsRevoked)
            {
                await _authRepository.RevokeAllUserRefreshTokensAsync(stored.UserId);
                throw new UnauthorizedException("Phát hiện Refresh Token đã qua sử dụng. Toàn bộ phiên đã bị thu hồi để bảo mật.");
            }

            if (stored.IsExpired)
            {
                throw new UnauthorizedException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            }

            if (!stored.User.IsActive)
            {
                await _authRepository.RevokeAllUserRefreshTokensAsync(stored.UserId);
                throw new ForbiddenException("Tài khoản đã bị tạm khóa.");
            }

            // Refresh Token Rotation: thu hồi token cũ và cấp cặp mới
            var (newRawRefresh, newHash, refreshExpiresAt) = CreateRefreshTokenRecord(stored.UserId, ipAddress);
            stored.RevokedAt = DateTime.UtcNow;
            stored.ReplacedByTokenHash = newHash;

            await _authRepository.AddRefreshTokenAsync(new RefreshToken
            {
                UserId = stored.UserId,
                TokenHash = newHash,
                ExpiresAt = refreshExpiresAt,
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ipAddress
            });

            var (accessToken, accessExpiresAt) = GenerateJwtToken(stored.User);
            var response = BuildAuthResponse("Làm mới phiên đăng nhập thành công!", accessToken, accessExpiresAt, stored.User);
            return (response, newRawRefresh, refreshExpiresAt);
        }

        public async Task LogoutAsync(string? refreshToken, int? userId = null)
        {
            if (!string.IsNullOrWhiteSpace(refreshToken))
            {
                var tokenHash = HashRefreshToken(refreshToken.Trim());
                var stored = await _authRepository.GetRefreshTokenByHashAsync(tokenHash);
                if (stored != null && !stored.IsRevoked)
                {
                    stored.RevokedAt = DateTime.UtcNow;
                    await _authRepository.SaveChangesAsync();
                }
            }
            else if (userId.HasValue && userId.Value > 0)
            {
                await _authRepository.RevokeAllUserRefreshTokensAsync(userId.Value);
            }
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _authRepository.GetByIdAsync(userId)
                ?? throw new NotFoundException("Không tìm thấy tài khoản người dùng.");

            if (!PasswordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash, user.PasswordSalt, out _))
            {
                throw new BadRequestException("Mật khẩu hiện tại không chính xác.");
            }

            if (dto.CurrentPassword == dto.NewPassword)
            {
                throw new BadRequestException("Mật khẩu mới phải khác mật khẩu hiện tại.");
            }

            PasswordHasher.CreatePasswordHash(dto.NewPassword, out var newHash, out var newSalt);
            user.PasswordHash = newHash;
            user.PasswordSalt = newSalt;
            await _authRepository.UpdateUserAsync(user);

            // Thu hồi toàn bộ Refresh Token đang hoạt động trên các thiết bị khác sau khi đổi mật khẩu
            await _authRepository.RevokeAllUserRefreshTokensAsync(userId);
        }

        public static string ValidatePublicRegistrationRole(string? requestedRole)
        {
            if (string.IsNullOrWhiteSpace(requestedRole))
            {
                return "Tenant";
            }

            var trimmed = requestedRole.Trim();
            if (trimmed.Equals("Tenant", StringComparison.OrdinalIgnoreCase))
            {
                return "Tenant";
            }

            if (trimmed.Equals("Owner", StringComparison.OrdinalIgnoreCase))
            {
                return "Owner";
            }

            throw new ForbiddenException(
                "Không được phép tự đăng ký với vai trò đặc quyền (Admin/Manager/Staff). Chỉ cho phép đăng ký Tenant hoặc Owner.");
        }

        private async Task<(string RawToken, DateTime ExpiresAt)> IssueRefreshTokenAsync(int userId, string? ipAddress)
        {
            var (rawToken, tokenHash, expiresAt) = CreateRefreshTokenRecord(userId, ipAddress);
            await _authRepository.AddRefreshTokenAsync(new RefreshToken
            {
                UserId = userId,
                TokenHash = tokenHash,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ipAddress
            });

            return (rawToken, expiresAt);
        }

        private (string RawToken, string TokenHash, DateTime ExpiresAt) CreateRefreshTokenRecord(int userId, string? ipAddress)
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            var rawToken = WebEncoders.Base64UrlEncode(randomBytes);
            var tokenHash = HashRefreshToken(rawToken);

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var refreshDays = double.TryParse(jwtSettings["RefreshTokenExpiryDays"], out var days) ? days : 7;
            var expiresAt = DateTime.UtcNow.AddDays(refreshDays);

            return (rawToken, tokenHash, expiresAt);
        }

        private static string HashRefreshToken(string rawToken)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToHexString(bytes);
        }

        private static AuthResponseDto BuildAuthResponse(string message, string token, DateTime expiresAt, User user) => new()
        {
            Message = message,
            Token = token,
            ExpiresAt = expiresAt,
            User = new AuthUserDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Department = user.Department,
                DateOfBirth = user.DateOfBirth
            }
        };

        private (string Token, DateTime ExpiresAt) GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKeyString = jwtSettings["SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKeyString) || secretKeyString.Length < 32)
            {
                throw new InvalidOperationException("Thiếu cấu hình JwtSettings:SecretKey.");
            }
            var secretKey = Encoding.UTF8.GetBytes(secretKeyString);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("Department", user.Department ?? "General")
            };

            if (user.DateOfBirth.HasValue)
            {
                var dobString = user.DateOfBirth.Value.ToString("yyyy-MM-dd");
                claims.Add(new Claim(ClaimTypes.DateOfBirth, dobString));
                claims.Add(new Claim("DateOfBirth", dobString));
            }

            var key = new SymmetricSecurityKey(secretKey);
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var issuer = jwtSettings["Issuer"] ?? "https://localhost:7255";
            var audience = jwtSettings["Audience"] ?? "https://localhost:7255";
            var expiryMinutes = double.TryParse(jwtSettings["ExpiryMinutes"], out var minutes) ? minutes : 15;
            var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: creds
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }
    }
}
