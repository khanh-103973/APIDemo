using APIDemo.Data;
using APIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly AppDbContext _context;

        public BookingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Booking>> GetAllAsync(string? status)
        {
            var query = _context.Bookings.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim();
                query = query.Where(b => b.Status == normalizedStatus);
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetAllForUserAsync(string? status, int userId, bool includeOwnedHouses)
        {
            var query = _context.Bookings
                .AsNoTracking()
                .Include(b => b.House)
                .AsQueryable();

            if (includeOwnedHouses)
            {
                query = query.Where(b => b.UserId == userId || (b.House != null && b.House.OwnerId == userId));
            }
            else
            {
                query = query.Where(b => b.UserId == userId);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim();
                query = query.Where(b => b.Status == normalizedStatus);
            }

            return await query.ToListAsync();
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings.FindAsync(id);
        }

        public async Task<Booking?> GetByIdWithHouseAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.House)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
        }

        public void Update(Booking booking)
        {
            _context.Bookings.Update(booking);
        }

        public void Delete(Booking booking)
        {
            _context.Bookings.Remove(booking);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
