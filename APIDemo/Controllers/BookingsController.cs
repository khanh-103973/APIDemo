using APIDemo.Models;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private static readonly List<Booking> _bookings = new()
        {
            new Booking
            {
                Id = 1,
                UserId = 2,
                HouseId = 1,
                StartDate = new DateTime(2026, 9, 10),
                EndDate = new DateTime(2027, 3, 10),
                Status = "Pending"
            },
            new Booking
            {
                Id = 2,
                UserId = 3,
                HouseId = 2,
                StartDate = new DateTime(2026, 10, 1),
                EndDate = new DateTime(2027, 10, 1),
                Status = "Approved"
            },
            new Booking
            {
                Id = 3,
                UserId = 4,
                HouseId = 3,
                StartDate = new DateTime(2026, 11, 15),
                EndDate = new DateTime(2027, 5, 15),
                Status = "Cancelled"
            }
        };

        // GET /api/bookings
        [HttpGet]
        public IActionResult GetAll([FromQuery] string? status)
        {
            var bookings = _bookings.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                bookings = bookings.Where(b => b.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
            }

            return Ok(bookings);
        }

        // GET /api/bookings/1
        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var booking = _bookings.FirstOrDefault(b => b.Id == id);

            if (booking is null)
            {
                return NotFound(new { message = $"Khong tim thay lich thue nha Id = {id}" });
            }

            return Ok(booking);
        }

        // POST /api/bookings
        [HttpPost]
        public IActionResult Create([FromBody] Booking booking)
        {
            if (booking is null || booking.StartDate >= booking.EndDate)
            {
                return BadRequest(new { message = "Du lieu khong hop le." });
            }

            booking.Id = _bookings.Any()
                ? _bookings.Max(b => b.Id) + 1
                : 1;

            booking.Status = string.IsNullOrWhiteSpace(booking.Status)
                ? "Pending"
                : booking.Status;

            _bookings.Add(booking);

            return CreatedAtAction(
                nameof(GetById),
                new { id = booking.Id },
                booking);
        }

        // PUT /api/bookings/1
        [HttpPut("{id:int}")]
        public IActionResult Update(int id, [FromBody] Booking updated)
        {
            if (updated.StartDate >= updated.EndDate)
            {
                return BadRequest(new { message = "Ngay bat dau phai nho hon ngay ket thuc." });
            }

            var booking = _bookings.FirstOrDefault(b => b.Id == id);

            if (booking is null)
            {
                return NotFound(new { message = $"Khong tim thay lich thue nha Id = {id}" });
            }

            booking.UserId = updated.UserId;
            booking.HouseId = updated.HouseId;
            booking.StartDate = updated.StartDate;
            booking.EndDate = updated.EndDate;
            booking.Status = updated.Status;

            return NoContent();
        }

        // DELETE /api/bookings/1
        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            var booking = _bookings.FirstOrDefault(b => b.Id == id);

            if (booking is null)
            {
                return NotFound(new { message = $"Khong tim thay lich thue nha Id = {id}" });
            }

            _bookings.Remove(booking);

            return NoContent();
        }
    }
}
