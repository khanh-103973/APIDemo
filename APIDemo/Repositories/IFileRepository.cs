using APIDemo.Models;

namespace APIDemo.Repositories
{
    public interface IFileRepository
    {
        Task<StoredFile> AddAsync(StoredFile file);
        Task<StoredFile?> GetByIdAsync(int id);
        Task<StoredFile?> GetByHashAsync(string hash);
        Task<StoredFile?> GetByFileNameAsync(string fileName);
        void Update(StoredFile file);
        Task<bool> SaveChangesAsync();
    }
}
