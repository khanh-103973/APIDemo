using APIDemo.DTOs.Common;
using APIDemo.Data;
using APIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _db;

        public UserRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<User>> GetAllAsync(UserQueryParameters queryParams)
        {
            var query = _db.Users.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var term = queryParams.SearchTerm.Trim().ToLower();
                query = query.Where(u => u.Username.ToLower().Contains(term)
                                      || u.Email.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(queryParams.Role))
            {
                query = query.Where(u => u.Role == queryParams.Role);
            }

            var totalCount = await query.CountAsync();

            var orderedQuery = queryParams.SortBy?.ToLowerInvariant() switch
            {
                "id" => queryParams.IsDescending ? query.OrderByDescending(u => u.Id) : query.OrderBy(u => u.Id),
                "fullname" => queryParams.IsDescending ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName),
                "role" => queryParams.IsDescending ? query.OrderByDescending(u => u.Role) : query.OrderBy(u => u.Role),
                "email" => queryParams.IsDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                "createdat" => queryParams.IsDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
                _ => queryParams.IsDescending ? query.OrderByDescending(u => u.Username) : query.OrderBy(u => u.Username)
            };

            // Id giúp thứ tự phân trang ổn định khi các giá trị sắp xếp trùng nhau.
            var offset = ((long)queryParams.PageNumber - 1) * queryParams.PageSize;
            var items = offset > int.MaxValue
                ? new List<User>()
                : await orderedQuery.ThenBy(u => u.Id)
                    .Skip((int)offset)
                    .Take(queryParams.PageSize)
                    .ToListAsync();

            return new PagedResult<User>(items, totalCount, queryParams.PageNumber, queryParams.PageSize);
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByUsernameOrEmailAsync(string username, string email)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Username == username || u.Email == email);
        }

        public async Task AddAsync(User user)
        {
            await _db.Users.AddAsync(user);
        }

        public void Update(User user)
        {
            _db.Users.Update(user);
        }

        public void Delete(User user)
        {
            _db.Users.Remove(user);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _db.SaveChangesAsync() > 0;
        }
    }
}
