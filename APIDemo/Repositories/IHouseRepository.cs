using APIDemo.DTOs.Common;
using APIDemo.Models;

namespace APIDemo.Repositories
{
    public interface IHouseRepository
    {
        Task<PageResult<House>> GetAllAsync(HouseQueryParameters queryParams);
        Task<House?> GetByIdAsync(int id);
        Task AddAsync(House house);
        void Update(House house);
        void Delete(House house);
        Task<bool> SaveChangesAsync();
    }
}