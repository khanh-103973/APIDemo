using APIDemo.Data;
using APIDemo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousesController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Inject AppDbContext kết nối CSDL
        public HousesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET /api/houses (Lấy danh sách nhà, có lọc theo trạng thái và giá tối thiểu)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] decimal? minPrice)
        {
            var query = _context.Houses.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(h => h.Status == status);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(h => h.Price >= minPrice.Value);
            }

            var houses = await query.ToListAsync();
            return Ok(houses);
        }

        // 2. GET /api/houses/{id} (Lấy chi tiết nhà theo ID)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var house = await _context.Houses.FindAsync(id);

            if (house is null)
            {
                return NotFound(new { message = $"Khong tim thay nha cho thue Id = {id}" });
            }

            return Ok(house);
        }

        // 3. POST /api/houses (Thêm nhà mới vào SQL Server)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] House house)
        {
            if (house is null)
            {
                return BadRequest(new { message = "Du lieu khong hop le." });
            }

            // Gán trạng thái mặc định nếu để trống
            house.Status = string.IsNullOrWhiteSpace(house.Status) ? "Available" : house.Status;

            _context.Houses.Add(house);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = house.Id },
                house);
        }

        // 4. PUT /api/houses/{id} (Cập nhật thông tin nhà trong SQL Server)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] House updated)
        {
            var house = await _context.Houses.FindAsync(id);

            if (house is null)
            {
                return NotFound(new { message = $"Khong tim thay nha cho thue Id = {id}" });
            }

            house.Title = updated.Title;
            house.Description = updated.Description;
            house.Address = updated.Address;
            house.Price = updated.Price;
            house.Area = updated.Area;
            house.Bedrooms = updated.Bedrooms;
            house.ImageUrl = updated.ImageUrl;
            house.Status = string.IsNullOrWhiteSpace(updated.Status) ? house.Status : updated.Status;
            house.OwnerId = updated.OwnerId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 5. DELETE /api/houses/{id} (Xóa nhà khỏi SQL Server)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var house = await _context.Houses.FindAsync(id);

            if (house is null)
            {
                return NotFound(new { message = $"Khong tim thay nha cho thue Id = {id}" });
            }

            _context.Houses.Remove(house);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}