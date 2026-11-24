using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Models;
using APIDemo.Repositories;

namespace APIDemo.Services
{
    public class HouseService : IHouseService
    {
        private readonly IHouseRepository _houseRepo;

        public HouseService(IHouseRepository houseRepo)
        {
            _houseRepo = houseRepo;
        }

        public async Task<PageResult<House>> GetAllHousesAsync(HouseQueryParameters queryParams)
        {
            return await _houseRepo.GetAllAsync(queryParams);
        }

        public async Task<House?> GetHouseByIdAsync(int id)
        {
            return await _houseRepo.GetByIdAsync(id);
        }

        public async Task<House> CreateHouseAsync(HouseDto dto)
        {
            var house = new House
            {
                Title = dto.Title,
                Description = dto.Description,
                Address = dto.Address,
                Price = dto.Price,
                Area = dto.Area,
                Bedrooms = dto.Bedrooms,
                ImageUrl = dto.ImageUrl,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Available" : dto.Status,
                OwnerId = dto.OwnerId
            };

            await _houseRepo.AddAsync(house);
            await _houseRepo.SaveChangesAsync();
            return house;
        }

        public async Task<bool> UpdateHouseAsync(int id, HouseDto dto)
        {
            var house = await _houseRepo.GetByIdAsync(id);
            if (house == null) return false;

            house.Title = dto.Title;
            house.Description = dto.Description;
            house.Address = dto.Address;
            house.Price = dto.Price;
            house.Area = dto.Area;
            house.Bedrooms = dto.Bedrooms;
            house.ImageUrl = dto.ImageUrl;
            house.Status = string.IsNullOrWhiteSpace(dto.Status) ? house.Status : dto.Status;
            house.OwnerId = dto.OwnerId;

            _houseRepo.Update(house);
            return await _houseRepo.SaveChangesAsync();
        }

        public async Task<bool> DeleteHouseAsync(int id)
        {
            var house = await _houseRepo.GetByIdAsync(id);
            if (house == null) return false;

            _houseRepo.Delete(house);
            return await _houseRepo.SaveChangesAsync();
        }
    }
}
