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

        public async Task<string?> LoginAsync(UserLoginDto dto)
        {
            // 1. Tìm kiếm người dùng trong Cơ sở dữ liệu theo Username
            var user = await _authRepository.GetByUsernameAsync(dto.Username);
            if (user == null)
            {
                throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không chính xác.");
            }

            // 2. Xác thực mật khẩu bằng cơ chế HMACSHA512 với PasswordSalt lưu trong CSDL
            if (user.PasswordSalt != null && user.PasswordHash != null && user.PasswordSalt.Length > 0)
            {
                using var hmac = new HMACSHA512(user.PasswordSalt);
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));

                // So sánh từng byte của mảng hash để chống tấn công Timing Attack
                if (!CryptographicOperations.FixedTimeEquals(computedHash, user.PasswordHash))
                {
                    throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không chính xác.");
                }
            }
            else if (string.IsNullOrEmpty(user.Password) || user.Password != dto.Password)
            {
                throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không chính xác.");
            }

            // 3. Đăng nhập thành công -> Tạo JWT Token từ dữ liệu thực của User trong CSDL
            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKeyString = jwtSettings["SecretKey"] ?? "Scretkey123456789123456789123456789123456789";
            var secretKey = Encoding.UTF8.GetBytes(secretKeyString);

            // Khai báo các Claims thực tế lấy từ thuộc tính của User trong CSDL
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role), // Role thực tế (Admin, Manager, Staff,...)
                new Claim("Department", user.Department ?? "General") // Claim Department thực tế
            };

            // Nếu người dùng có ngày sinh trong CSDL thì đưa vào Claim
            if (user.DateOfBirth.HasValue)
            {
                var dobString = user.DateOfBirth.Value.ToString("yyyy-MM-dd");
                claims.Add(new Claim(ClaimTypes.DateOfBirth, dobString));
                claims.Add(new Claim("DateOfBirth", dobString)); // Phục vụ Custom Requirement Handler
            }

            var key = new SymmetricSecurityKey(secretKey);
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var issuer = jwtSettings["Issuer"] ?? "https://localhost:7255";
            var audience = jwtSettings["Audience"] ?? "https://localhost:7255";
            var expiryMinutes = double.TryParse(jwtSettings["ExpiryMinutes"], out var minutes) ? minutes : 60;

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
