using APIDemo.Data;
using APIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Repositories
{
    public class FileRepository : IFileRepository
    {
        private readonly AppDbContext _context;

        public FileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<StoredFile> AddAsync(StoredFile file)
        {
            await _context.StoredFiles.AddAsync(file);
            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<StoredFile?> GetByIdAsync(int id)
        {
            return await _context.StoredFiles.FindAsync(id);
        }

        public async Task<StoredFile?> GetByHashAsync(string hash)
        {
            return await _context.StoredFiles.FirstOrDefaultAsync(f => f.FileHash == hash);
        }

        public async Task<StoredFile?> GetByFileNameAsync(string fileName)
        {
            return await _context.StoredFiles.FirstOrDefaultAsync(f => f.FileName == fileName);
        }

        public void Update(StoredFile file)
        {
            _context.StoredFiles.Update(file);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
