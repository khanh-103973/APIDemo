using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Repositories;
using APIDemo.Security;
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

        public async Task<AuthResponseDto> RegisterAsync(UserRegisterDto dto)
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
                // Chặn tự gán Department = "HR" để vượt qua Policy MustBeHR khi tự đăng ký
                Department = "General",
                DateOfBirth = dto.DateOfBirth,
                CreatedAt = DateTime.UtcNow
            };

            await _authRepository.CreateUserAsync(user);

            var (token, expiresAt) = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Message = "Đăng ký tài khoản thành công!",
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
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
        {
            var identifier = dto.Username.Trim();
            var user = await _authRepository.GetByUsernameAsync(identifier)
                ?? await _authRepository.GetByEmailAsync(identifier.ToLowerInvariant());
            if (user == null) return null;

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

            return new AuthResponseDto
            {
                Message = "Đăng nhập thành công!",
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
            var expiryMinutes = double.TryParse(jwtSettings["ExpiryMinutes"], out var minutes) ? minutes : 60;
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
