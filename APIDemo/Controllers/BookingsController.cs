using APIDemo.Data;
using APIDemo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Inject AppDbContext kết nối CSDL
        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET /api/bookings (Lấy danh sách đặt phòng, hỗ trợ lọc theo trạng thái)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var query = _context.Bookings.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(b => b.Status == status);
            }

            var bookings = await query.ToListAsync();
            return Ok(bookings);
        }

        // 2. GET /api/bookings/{id} (Lấy chi tiết 1 lịch đặt phòng)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);

            if (booking is null)
            {
                return NotFound(new { message = $"Khong tim thay lich thue nha Id = {id}" });
            }

            return Ok(booking);
        }

        // 3. POST /api/bookings (Tạo mới lịch đặt phòng)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Booking booking)
        {
            if (booking is null || booking.StartDate >= booking.EndDate)
            {
                return BadRequest(new { message = "Du lieu khong hop le hoac ngay bat dau phai nho hon ngay ket thuc." });
            }

            // Gán trạng thái mặc định nếu để trống
            booking.Status = string.IsNullOrWhiteSpace(booking.Status) ? "Pending" : booking.Status;

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = booking.Id },
                booking);
        }

        // 4. PUT /api/bookings/{id} (Cập nhật lịch đặt phòng)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Booking updated)
        {
            if (updated.StartDate >= updated.EndDate)
            {
                return BadRequest(new { message = "Ngay bat dau phai nho hon ngay ket thuc." });
            }

            var booking = await _context.Bookings.FindAsync(id);

            if (booking is null)
            {
                return NotFound(new { message = $"Khong tim thay lich thue nha Id = {id}" });
            }

            booking.UserId = updated.UserId;
            booking.HouseId = updated.HouseId;
            booking.StartDate = updated.StartDate;
            booking.EndDate = updated.EndDate;
            booking.Status = string.IsNullOrWhiteSpace(updated.Status) ? booking.Status : updated.Status;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 5. DELETE /api/bookings/{id} (Xóa lịch đặt phòng)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);

            if (booking is null)
            {
                return NotFound(new { message = $"Khong tim thay lich thue nha Id = {id}" });
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}