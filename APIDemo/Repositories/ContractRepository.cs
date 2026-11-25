using APIDemo.Data;
using APIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Repositories
{
    public class ContractRepository : IContractRepository
    {
        private readonly AppDbContext _context;

        public ContractRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Contract>> GetAllAsync(string? status)
        {
            var query = _context.Contracts.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim();
                query = query.Where(c => c.Status == normalizedStatus);
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Contract>> GetAllForUserAsync(string? status, int userId, bool includeOwnedHouses)
        {
            var query = _context.Contracts
                .AsNoTracking()
                .Include(c => c.Booking)
                    .ThenInclude(b => b!.House)
                .AsQueryable();

            if (includeOwnedHouses)
            {
                query = query.Where(c =>
                    c.Booking != null &&
                    (c.Booking.UserId == userId || (c.Booking.House != null && c.Booking.House.OwnerId == userId)));
            }
            else
            {
                query = query.Where(c => c.Booking != null && c.Booking.UserId == userId);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim();
                query = query.Where(c => c.Status == normalizedStatus);
            }

            return await query.ToListAsync();
        }

        public async Task<Contract?> GetByIdAsync(int id)
        {
            return await _context.Contracts.FindAsync(id);
        }

        public async Task<Contract?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Contracts
                .Include(c => c.Booking)
                    .ThenInclude(b => b!.House)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Contract?> GetByBookingIdAsync(int bookingId)
        {
            return await _context.Contracts
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.BookingId == bookingId);
        }

        public async Task<Contract?> GetByBookingIdWithDetailsAsync(int bookingId)
        {
            return await _context.Contracts
                .AsNoTracking()
                .Include(c => c.Booking)
                    .ThenInclude(b => b!.House)
                .FirstOrDefaultAsync(c => c.BookingId == bookingId);
        }

        public async Task AddAsync(Contract contract)
        {
            await _context.Contracts.AddAsync(contract);
        }

        public void Update(Contract contract)
        {
            _context.Contracts.Update(contract);
        }

        public void Delete(Contract contract)
        {
            _context.Contracts.Remove(contract);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
