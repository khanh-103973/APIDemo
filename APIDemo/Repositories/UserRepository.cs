using APIDemo.Data;
using APIDemo.DTOs.Common;
using APIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PageResult<User>> GetAllAsync(UserQueryParameters queryParams)
        {
            var query = _context.Users.AsNoTracking().AsQueryable();

            // 1. SEARCH (Tìm kiếm tương đối)
            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var term = queryParams.SearchTerm.Trim().ToLower();
                query = query.Where(u => u.Username.ToLower().Contains(term)
                                      || u.Email.ToLower().Contains(term));
            }

            // 2. FILTER (Lọc chính xác)
            if (!string.IsNullOrWhiteSpace(queryParams.Role))
            {
                query = query.Where(u => u.Role == queryParams.Role);
            }

            // 3. SORTING
            query = queryParams.SortBy?.ToLower() switch
            {
                "email" => queryParams.IsDescending
                    ? query.OrderByDescending(u => u.Email)
                    : query.OrderBy(u => u.Email),

                "createdat" => queryParams.IsDescending
                    ? query.OrderByDescending(u => u.CreatedAt)
                    : query.OrderBy(u => u.CreatedAt),

                _ => queryParams.IsDescending
                    ? query.OrderByDescending(u => u.Username)
                    : query.OrderBy(u => u.Username) // Mặc định sort theo Username
            };

            // 4. COUNT (Tổng số dòng thỏa điều kiện)
            var totalCount = await query.CountAsync();

            // 5. PAGINATION (Chỉ lấy đúng PageSize dòng từ DB)
            var items = await query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .ToListAsync();

            return new PageResult<User>(items, totalCount, queryParams.PageNumber, queryParams.PageSize);
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User?> GetByUsernameOrEmailAsync(string username, string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username || u.Email == email);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public void Update(User user)
        {
            _context.Users.Update(user);
        }

        public void Delete(User user)
        {
            _context.Users.Remove(user);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}