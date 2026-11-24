using APIDemo.DTOs;

namespace APIDemo.Services
{
    public interface IAuthService
    {
        Task<string?> LoginAsync(UserLoginDto dto);
    }
}
