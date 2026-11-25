using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Models;

namespace APIDemo.Services
{
    public interface IHouseService
    {
        Task<PageResult<House>> GetAllHousesAsync(HouseQueryParameters queryParams);
        Task<House?> GetHouseByIdAsync(int id);
        Task<House> CreateHouseAsync(HouseDto dto);
        Task<bool> UpdateHouseAsync(int id, HouseDto dto);
        Task<bool> DeleteHouseAsync(int id);
    }
}
