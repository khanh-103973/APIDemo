using APIDemo.DTOs.Common;
using APIDemo.Models;

namespace APIDemo.Repositories
{
    public interface IUserRepository
    {
        Task<PageResult<User>> GetAllAsync(UserQueryParameters queryParams);
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameOrEmailAsync(string username, string email);
        Task AddAsync(User user);
        void Update(User user);
        void Delete(User user);
        Task<bool> SaveChangesAsync();
    }
}