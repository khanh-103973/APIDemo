using APIDemo.Models;

namespace APIDemo.Repositories
{
    public interface IBookingRepository
    {
        Task<IEnumerable<Booking>> GetAllAsync(string? status);
        Task<IEnumerable<Booking>> GetAllForUserAsync(string? status, int userId, bool includeOwnedHouses);
        Task<Booking?> GetByIdAsync(int id);
        Task<Booking?> GetByIdWithHouseAsync(int id);
        Task AddAsync(Booking booking);
        void Update(Booking booking);
        void Delete(Booking booking);
        Task<bool> SaveChangesAsync();
    }
}
