using APIDemo.DTOs;

namespace APIDemo.Services
{
    public interface IAuthService
    {
        Task<(AuthResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiresAt)?> LoginAsync(
            LoginDto dto,
            string? ipAddress = null);

        Task<(AuthResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiresAt)> RegisterAsync(
            UserRegisterDto dto,
            string? ipAddress = null);

        Task<(AuthResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiresAt)> RefreshAsync(
            string refreshToken,
            string? ipAddress = null);

        Task LogoutAsync(string? refreshToken, int? userId = null);

        Task ChangePasswordAsync(int userId, ChangePasswordDto dto);
    }
}
