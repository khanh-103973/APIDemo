using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Models;
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

        // 1. GET /api/houses (Ai cũng xem được - Hỗ trợ Pagination, Filtering, Searching, Sorting)
        [HttpGet]
        public async Task<ActionResult<PageResult<House>>> GetAll([FromQuery] HouseQueryParameters queryParams)
        {
            var result = await _houseService.GetAllHousesAsync(queryParams);
            return Ok(result);
        }

        // 2. GET /api/houses/{id} (Ai cũng xem được)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var house = await _houseService.GetHouseByIdAsync(id);
            if (house == null)
                return NotFound(new { message = $"Không tìm thấy nhà cho thuê Id = {id}" });

            return Ok(house);
        }

        // 3. POST /api/houses (Chỉ Chủ nhà - Owner hoặc Admin mới được đăng nhà)
        [HttpPost]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Create([FromBody] HouseDto dto)
        {
            var created = await _houseService.CreateHouseAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // 4. PUT /api/houses/{id} (Chỉ Chủ nhà - Owner hoặc Admin mới được sửa thông tin nhà)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] HouseDto dto)
        {
            var success = await _houseService.UpdateHouseAsync(id, dto);
            if (!success)
                return NotFound(new { message = $"Không tìm thấy nhà cho thuê Id = {id}" });

            return Ok(new { message = "Cập nhật nhà thành công." });
        }

        // 5. DELETE /api/houses/{id} (Chỉ duy nhất Admin mới có quyền xóa nhà)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _houseService.DeleteHouseAsync(id);
            if (!success)
                return NotFound(new { message = $"Không tìm thấy nhà cho thuê Id = {id}" });

            return Ok(new { message = "Đã xóa nhà thành công." });
        }
    }
}
