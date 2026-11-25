using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        // Inject IBookingService thay vì AppDbContext
        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // 1. GET /api/bookings (Lấy danh sách đặt phòng, hỗ trợ lọc theo trạng thái)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var bookings = await _bookingService.GetAllBookingsAsync(status);
            return Ok(bookings);
        }

        // 2. GET /api/bookings/{id} (Lấy chi tiết 1 lịch đặt phòng)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy lịch thuê nhà Id = {id}");

            return Ok(booking);
        }

        // 3. POST /api/bookings (Tạo mới lịch đặt phòng - Yêu cầu người thuê từ 18 tuổi trở lên theo Policy AtLeast18)
        [HttpPost]
        [Authorize(Policy = "AtLeast18")]
        public async Task<IActionResult> Create([FromBody] BookingDto dto)
        {
            var result = await _bookingService.CreateBookingAsync(dto);
            if (!result.IsSuccess)
            {
                throw new BadRequestException(result.Message);
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.Id },
                result.Data);
        }

        // 4. PUT /api/bookings/{id} (Cập nhật lịch đặt phòng)
        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] BookingDto dto)
        {
            var result = await _bookingService.UpdateBookingAsync(id, dto);
            if (!result.IsSuccess)
            {
                if (result.IsNotFound)
                {
                    throw new NotFoundException(result.Message);
                }

                throw new BadRequestException(result.Message);
            }

            return NoContent();
        }

        // 5. DELETE /api/bookings/{id} (Xóa lịch đặt phòng)
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookingService.DeleteBookingAsync(id);
            if (!result.IsSuccess)
            {
                throw new NotFoundException(result.Message);
            }

            return NoContent();
        }
    }
}
