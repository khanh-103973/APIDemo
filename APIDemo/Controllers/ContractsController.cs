using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractsController : ControllerBase
    {
        private readonly IContractService _contractService;

        public ContractsController(IContractService contractService)
        {
            _contractService = contractService;
        }

        // 1. GET /api/contracts (Xem danh sách hợp đồng, lọc theo Status - Admin, Owner)
        [HttpGet]
        [Authorize(Roles = "Admin,Owner")]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var contracts = await _contractService.GetAllContractsAsync(status);
            return Ok(contracts);
        }

        // 2. GET /api/contracts/{id} (Chi tiết hợp đồng)
        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var contract = await _contractService.GetContractByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy hợp đồng thuê nhà Id = {id}");

            return Ok(contract);
        }

        // 3. GET /api/contracts/booking/{bookingId} (Tìm hợp đồng theo BookingId)
        [HttpGet("booking/{bookingId:int}")]
        [Authorize]
        public async Task<IActionResult> GetByBookingId(int bookingId)
        {
            var contract = await _contractService.GetContractByBookingIdAsync(bookingId)
                ?? throw new NotFoundException($"Không tìm thấy hợp đồng cho lịch đặt phòng Id = {bookingId}");

            return Ok(contract);
        }

        // 4. POST /api/contracts (Tạo hợp đồng - Chỉ Admin hoặc Owner và người ký phải từ 18 tuổi trở lên)
        [HttpPost]
        [Authorize(Roles = "Admin,Owner", Policy = "AtLeast18")]
        public async Task<IActionResult> Create([FromBody] ContractDto dto)
        {
            var result = await _contractService.CreateContractAsync(dto);
            if (!result.IsSuccess)
            {
                throw new BadRequestException(result.Message);
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.Id },
                result.Data);
        }

        // 5. PUT /api/contracts/{id} (Cập nhật hợp đồng - Chỉ Admin hoặc Owner)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Owner")]
        public async Task<IActionResult> Update(int id, [FromBody] ContractDto dto)
        {
            var result = await _contractService.UpdateContractAsync(id, dto);
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

        // 6. DELETE /api/contracts/{id} (Xóa hợp đồng - Chỉ Admin)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _contractService.DeleteContractAsync(id);
            if (!result.IsSuccess)
            {
                throw new NotFoundException(result.Message);
            }

            return NoContent();
        }
    }
}
