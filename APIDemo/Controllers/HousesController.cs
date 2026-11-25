using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Security;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousesController : ControllerBase
    {
        private readonly IHouseService _houseService;

        public HousesController(IHouseService houseService)
        {
            _houseService = houseService;
        }

        // 1. GET /api/houses (Công khai - Hỗ trợ Pagination, Filtering, Searching, Sorting)
        [HttpGet]
        public async Task<ActionResult<PageResult<House>>> GetAll([FromQuery] HouseQueryParameters queryParams)
        {
            var result = await _houseService.GetAllHousesAsync(queryParams);
            return Ok(result);
        }

        // 2. GET /api/houses/{id} (Công khai)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var house = await _houseService.GetHouseByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy nhà cho thuê Id = {id}");

            return Ok(house);
        }

        // 3. POST /api/houses (Owner/Manager/Admin - ép OwnerId theo JWT nếu không phải Admin)
        [HttpPost]
        [Authorize(Roles = "Owner,Manager,Admin")]
        public async Task<IActionResult> Create([FromBody] HouseDto dto)
        {
            var currentUserId = User.GetUserId();
            if (!User.IsAdmin())
            {
                dto.OwnerId = currentUserId;
            }
            else if (dto.OwnerId <= 0)
            {
                dto.OwnerId = currentUserId;
            }

            var created = await _houseService.CreateHouseAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // 4. PUT /api/houses/{id} (Kiểm tra quyền sở hữu OwnerId nếu không phải Admin)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Owner,Manager,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] HouseDto dto)
        {
            var existing = await _houseService.GetHouseByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy nhà cho thuê Id = {id}");

            var currentUserId = User.GetUserId();
            if (!User.IsAdmin())
            {
                if (existing.OwnerId != currentUserId)
                {
                    throw new ForbiddenException("Bạn không có quyền chỉnh sửa nhà cho thuê của chủ nhà khác.");
                }

                // Không cho phép tự chuyển nhượng OwnerId sang tài khoản khác
                dto.OwnerId = existing.OwnerId;
            }

            var success = await _houseService.UpdateHouseAsync(id, dto);
            if (!success)
                throw new NotFoundException($"Không tìm thấy nhà cho thuê Id = {id}");

            return Ok(new { message = "Cập nhật nhà thành công." });
        }

        // 5. DELETE /api/houses/{id} (Admin xóa mọi nhà; Owner/Manager chỉ được xóa nhà do mình sở hữu)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Owner,Manager,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _houseService.GetHouseByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy nhà cho thuê Id = {id}");

            var currentUserId = User.GetUserId();
            if (!User.IsAdmin() && existing.OwnerId != currentUserId)
            {
                throw new ForbiddenException("Bạn không có quyền xóa nhà cho thuê của chủ nhà khác.");
            }

            var success = await _houseService.DeleteHouseAsync(id);
            if (!success)
                throw new NotFoundException($"Không tìm thấy nhà cho thuê Id = {id}");

            return Ok(new { message = "Đã xóa nhà thành công." });
        }
    }
}
