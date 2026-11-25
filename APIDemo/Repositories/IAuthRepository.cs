using APIDemo.Models;

namespace APIDemo.Repositories
{
    public interface IAuthRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> ExistsByUsernameAsync(string username);
        Task<bool> ExistsByEmailAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task UpdateUserAsync(User user);
        Task AddRefreshTokenAsync(RefreshToken refreshToken);
        Task<RefreshToken?> GetRefreshTokenByHashAsync(string tokenHash);
        Task RevokeAllUserRefreshTokensAsync(int userId);
        Task SaveChangesAsync();
    }
}
