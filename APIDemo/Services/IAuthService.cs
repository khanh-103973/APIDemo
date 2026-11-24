using APIDemo.DTOs;

namespace APIDemo.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto dto);
        Task<AuthResponseDto> RegisterAsync(UserRegisterDto dto);
    }
}
