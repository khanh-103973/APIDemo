using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Security;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // 1. GET /api/bookings (Admin xem tất cả; Owner/Manager xem lịch nhà mình; Tenant chỉ xem lịch của mình)
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<BookingResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetAll([FromQuery] string? status)
        {
            var bookings = await _bookingService.GetAllBookingsAsync(
                status,
                User.GetUserId(),
                User.IsAdmin(),
                User.IsOwnerOrManager());
            return Ok(bookings);
        }

        // 2. GET /api/bookings/{id} (Kiểm tra quyền TenantId / House OwnerId / Admin)
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<BookingResponseDto>> GetById(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id, User.GetUserId(), User.IsAdmin())
                ?? throw new NotFoundException($"Không tìm thấy lịch thuê nhà Id = {id}");

            return Ok(booking);
        }

        // 3. POST /api/bookings (Yêu cầu >= 18 tuổi và không được giả mạo UserId người khác)
        [HttpPost]
        [Authorize(Policy = "AtLeast18")]
        [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status201Created)]
        public async Task<ActionResult<BookingResponseDto>> Create([FromBody] BookingDto dto)
        {
            var result = await _bookingService.CreateBookingAsync(dto, User.GetUserId(), User.IsAdmin());
            if (!result.IsSuccess)
            {
                throw new BadRequestException(result.Message);
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.Id },
                result.Data);
        }

        // 4. PUT /api/bookings/{id} (Kiểm tra quyền sở hữu Tenant/Owner/Admin)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] BookingDto dto)
        {
            var result = await _bookingService.UpdateBookingAsync(id, dto, User.GetUserId(), User.IsAdmin());
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

        // 5. DELETE /api/bookings/{id} (Kiểm tra quyền sở hữu Tenant/Owner/Admin)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookingService.DeleteBookingAsync(id, User.GetUserId(), User.IsAdmin());
            if (!result.IsSuccess)
            {
                throw new NotFoundException(result.Message);
            }

            return NoContent();
        }
    }
}
