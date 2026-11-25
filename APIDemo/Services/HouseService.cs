using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Models;
using APIDemo.Repositories;

namespace APIDemo.Services
{
    public class HouseService : IHouseService
    {
        private readonly IHouseRepository _houseRepo;
        private readonly IImageStorageService _imageStorage;

        public HouseService(IHouseRepository houseRepo, IImageStorageService imageStorage)
        {
            _houseRepo = houseRepo;
            _imageStorage = imageStorage;
        }

        public async Task<PageResult<HouseResponseDto>> GetAllHousesAsync(HouseQueryParameters queryParams)
        {
            var page = await _houseRepo.GetAllAsync(queryParams);
            var dtoItems = page.Items.Select(MapToResponseDto).ToList();
            return new PageResult<HouseResponseDto>(dtoItems, page.TotalCount, page.PageNumber, page.PageSize);
        }

        public async Task<HouseResponseDto?> GetHouseByIdAsync(int id)
        {
            var house = await _houseRepo.GetByIdAsync(id);
            return house is null ? null : MapToResponseDto(house);
        }

        public async Task<HouseResponseDto> CreateHouseAsync(HouseDto dto)
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
            return MapToResponseDto(house);
        }

        public async Task<bool> UpdateHouseAsync(int id, HouseDto dto)
        {
            var house = await _houseRepo.GetByIdAsync(id);
            if (house == null) return false;

            var oldImageUrl = house.ImageUrl;

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
            var saved = await _houseRepo.SaveChangesAsync();

            // Tự động dọn file ảnh cục bộ cũ nếu chủ nhà thay bằng ảnh mới
            if (saved &&
                !string.IsNullOrWhiteSpace(oldImageUrl) &&
                !string.Equals(oldImageUrl.Trim(), (dto.ImageUrl ?? string.Empty).Trim(), StringComparison.OrdinalIgnoreCase))
            {
                await _imageStorage.DeleteImageAsync(oldImageUrl);
            }

            return saved;
        }

        public async Task<bool> DeleteHouseAsync(int id)
        {
            var house = await _houseRepo.GetByIdAsync(id);
            if (house == null) return false;

            var oldImageUrl = house.ImageUrl;

            // Soft Delete (IsDeleted = true, DeletedAt = UtcNow)
            _houseRepo.Delete(house);
            var saved = await _houseRepo.SaveChangesAsync();

            if (saved && !string.IsNullOrWhiteSpace(oldImageUrl))
            {
                await _imageStorage.DeleteImageAsync(oldImageUrl);
            }

            return saved;
        }

        private static HouseResponseDto MapToResponseDto(House house)
        {
            return new HouseResponseDto
            {
                Id = house.Id,
                Title = house.Title,
                Description = house.Description,
                Address = house.Address,
                Price = house.Price,
                Area = house.Area,
                Bedrooms = house.Bedrooms,
                ImageUrl = house.ImageUrl,
                Status = house.Status,
                OwnerId = house.OwnerId,
                OwnerName = house.Owner?.FullName,
                CreatedAt = house.CreatedAt,
                UpdatedAt = house.UpdatedAt
            };
        }
    }
}
