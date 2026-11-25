using APIDemo.Models;

namespace APIDemo.Repositories
{
    public interface IContractRepository
    {
        Task<IEnumerable<Contract>> GetAllAsync(string? status);
        Task<Contract?> GetByIdAsync(int id);
        Task<Contract?> GetByBookingIdAsync(int bookingId);
        Task AddAsync(Contract contract);
        void Update(Contract contract);
        void Delete(Contract contract);
        Task<bool> SaveChangesAsync();
    }
}
