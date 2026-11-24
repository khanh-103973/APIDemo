using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Repositories;
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
            if (await _authRepository.ExistsByUsernameAsync(dto.Username))
            {
                throw new ConflictException($"Tên đăng nhập '{dto.Username}' đã tồn tại trong hệ thống.");
            }

            if (await _authRepository.ExistsByEmailAsync(dto.Email))
            {
                throw new ConflictException($"Email '{dto.Email}' đã được sử dụng.");
            }

            CreatePasswordHash(dto.Password, out var hash, out var salt);

            var user = new User
            {
                Username = dto.Username.Trim(),
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim().ToLowerInvariant(),
                PasswordHash = hash,
                PasswordSalt = salt,
                Phone = string.IsNullOrWhiteSpace(dto.Phone) ? "0912345678" : dto.Phone.Trim(),
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "Tenant" : dto.Role.Trim(),
                Department = string.IsNullOrWhiteSpace(dto.Department) ? "General" : dto.Department.Trim(),
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
            var user = await _authRepository.GetByUsernameAsync(dto.Username);
            if (user == null) return null;

            // Băm lại mật khẩu vừa nhập bằng Salt của user trong DB
            if (user.PasswordSalt != null && user.PasswordHash != null && user.PasswordSalt.Length > 0)
            {
                using var hmac = new HMACSHA512(user.PasswordSalt);
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));

                // So sánh từng byte an toàn chống Timing Attack
                if (!CryptographicOperations.FixedTimeEquals(computedHash, user.PasswordHash))
                {
                    return null; // Sai mật khẩu
                }
            }
            else
            {
                return null;
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

        private (string Token, DateTime ExpiresAt) GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKeyString = jwtSettings["SecretKey"] ?? "Scretkey123456789123456789123456789123456789";
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

        private static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key;
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}
