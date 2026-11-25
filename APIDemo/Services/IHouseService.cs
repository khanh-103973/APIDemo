using APIDemo.DTOs;
using APIDemo.DTOs.Common;

namespace APIDemo.Services
{
    public interface IHouseService
    {
        Task<PageResult<HouseResponseDto>> GetAllHousesAsync(HouseQueryParameters queryParams);
        Task<HouseResponseDto?> GetHouseByIdAsync(int id);
        Task<HouseResponseDto> CreateHouseAsync(HouseDto dto);
        Task<bool> UpdateHouseAsync(int id, HouseDto dto);
        Task<bool> DeleteHouseAsync(int id);
    }
}
