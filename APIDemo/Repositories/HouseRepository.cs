using APIDemo.Data;
using APIDemo.DTOs.Common;
using APIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Repositories
{
    public class HouseRepository : IHouseRepository
    {
        private readonly AppDbContext _context;

        public HouseRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PageResult<House>> GetAllAsync(HouseQueryParameters queryParams)
        {
            var query = _context.Houses
                .AsNoTracking()
                .Include(h => h.Owner)
                .AsQueryable();

            // 1. SEARCH (Tìm kiếm tương đối theo Title hoặc Address)
            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var term = queryParams.SearchTerm.Trim().ToLower();
                query = query.Where(h => h.Title.ToLower().Contains(term)
                                      || h.Address.ToLower().Contains(term));
            }

            // 2. FILTER (Lọc chính xác / theo khoảng)
            if (!string.IsNullOrWhiteSpace(queryParams.Status))
            {
                var status = queryParams.Status.Trim();
                query = query.Where(h => h.Status == status);
            }

            if (queryParams.MinPrice.HasValue)
            {
                query = query.Where(h => h.Price >= queryParams.MinPrice.Value);
            }

            if (queryParams.MaxPrice.HasValue)
            {
                query = query.Where(h => h.Price <= queryParams.MaxPrice.Value);
            }

            if (queryParams.Bedrooms.HasValue)
            {
                query = query.Where(h => h.Bedrooms == queryParams.Bedrooms.Value);
            }

            // 3. SORTING
            query = queryParams.SortBy?.Trim().ToLower() switch
            {
                "price" => queryParams.IsDescending
                    ? query.OrderByDescending(h => h.Price)
                    : query.OrderBy(h => h.Price),

                "area" => queryParams.IsDescending
                    ? query.OrderByDescending(h => h.Area)
                    : query.OrderBy(h => h.Area),

                "title" => queryParams.IsDescending
                    ? query.OrderByDescending(h => h.Title)
                    : query.OrderBy(h => h.Title),

                _ => queryParams.IsDescending
                    ? query.OrderByDescending(h => h.Id)
                    : query.OrderBy(h => h.Id) // Mặc định sắp xếp theo Id
            };

            // 4. COUNT (Tổng số dòng thỏa điều kiện)
            var totalCount = await query.CountAsync();

            // 5. PAGINATION (Chỉ lấy đúng PageSize dòng từ DB)
            var items = await query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .ToListAsync();

            return new PageResult<House>(items, totalCount, queryParams.PageNumber, queryParams.PageSize);
        }

        public async Task<House?> GetByIdAsync(int id)
        {
            return await _context.Houses
                .Include(h => h.Owner)
                .FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task AddAsync(House house)
        {
            await _context.Houses.AddAsync(house);
        }

        public void Update(House house)
        {
            _context.Houses.Update(house);
        }

        public void Delete(House house)
        {
            house.IsDeleted = true;
            house.DeletedAt = DateTime.UtcNow;
            _context.Houses.Update(house);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}