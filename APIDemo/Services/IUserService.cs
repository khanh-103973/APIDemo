using APIDemo.DTOs;
using APIDemo.DTOs.Common;

namespace APIDemo.Services
{
    public interface IUserService
    {
        Task<PageResult<UserResponseDto>> GetAllAsync(UserQueryParameters queryParams);
        Task<UserResponseDto?> GetByIdAsync(int id);
        Task<(bool IsSuccess, string Message, UserResponseDto? Data)> RegisterAsync(UserRegisterDto request);
        Task<(bool IsSuccess, string Message)> UpdateAsync(int id, UserRegisterDto request, bool allowRoleUpdate = false);
        Task<(bool IsSuccess, bool IsNotFound, string Message)> SetActiveStatusAsync(int id, bool isActive);
        Task<(bool IsSuccess, string Message)> DeleteAsync(int id);
    }
}
