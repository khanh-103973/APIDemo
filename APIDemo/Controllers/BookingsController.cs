using APIDemo.Data;
using APIDemo.Exceptions;
using APIDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/bookings
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var query = _context.Bookings.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(b => b.Status.ToLower() == status.ToLower());
            }

            var bookings = await query.ToListAsync();
            return Ok(bookings);
        }

        // GET /api/bookings/1
        [HttpGet("{id:int}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetById(int id)
        {
            var booking = await _context.Bookings.FindAsync(id)
                ?? throw new NotFoundException($"Khong tim thay lich thue nha Id = {id}");

            return Ok(booking);
        }

        // POST /api/bookings
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Booking booking)
        {
            if (booking is null || booking.StartDate >= booking.EndDate)
            {
                throw new BadRequestException("Du lieu khong hop le.");
            }

            booking.Id = 0;
            booking.Status = string.IsNullOrWhiteSpace(booking.Status) ? "Pending" : booking.Status;

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = booking.Id },
                booking);
        }

        // PUT /api/bookings/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Booking updated)
        {
            if (updated.StartDate >= updated.EndDate)
            {
                throw new BadRequestException("Ngay bat dau phai nho hon ngay ket thuc.");
            }

            var booking = await _context.Bookings.FindAsync(id)
                ?? throw new NotFoundException($"Khong tim thay lich thue nha Id = {id}");

            booking.UserId = updated.UserId;
            booking.HouseId = updated.HouseId;
            booking.StartDate = updated.StartDate;
            booking.EndDate = updated.EndDate;
            booking.Status = updated.Status;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/bookings/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var booking = await _context.Bookings.FindAsync(id)
                ?? throw new NotFoundException($"Khong tim thay lich thue nha Id = {id}");

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
