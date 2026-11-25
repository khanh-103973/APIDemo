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
    public class ContractsController : ControllerBase
    {
        private readonly IContractService _contractService;

        public ContractsController(IContractService contractService)
        {
            _contractService = contractService;
        }

        // 1. GET /api/contracts (Admin xem tất cả; Owner/Manager xem hợp đồng nhà mình; Tenant xem hợp đồng của mình)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var contracts = await _contractService.GetAllContractsAsync(
                status,
                User.GetUserId(),
                User.IsAdmin(),
                User.IsOwnerOrManager());
            return Ok(contracts);
        }

        // 2. GET /api/contracts/{id} (Kiểm tra quyền sở hữu Tenant/Owner/Admin)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var contract = await _contractService.GetContractByIdAsync(id, User.GetUserId(), User.IsAdmin())
                ?? throw new NotFoundException($"Không tìm thấy hợp đồng thuê nhà Id = {id}");

            return Ok(contract);
        }

        // 3. GET /api/contracts/booking/{bookingId} (Kiểm tra quyền sở hữu Tenant/Owner/Admin)
        [HttpGet("booking/{bookingId:int}")]
        public async Task<IActionResult> GetByBookingId(int bookingId)
        {
            var contract = await _contractService.GetContractByBookingIdAsync(bookingId, User.GetUserId(), User.IsAdmin())
                ?? throw new NotFoundException($"Không tìm thấy hợp đồng cho lịch đặt phòng Id = {bookingId}");

            return Ok(contract);
        }

        // 4. POST /api/contracts (Admin hoặc chính Chủ nhà của căn nhà trong Booking, >= 18 tuổi)
        [HttpPost]
        [Authorize(Roles = "Admin,Owner,Manager", Policy = "AtLeast18")]
        public async Task<IActionResult> Create([FromBody] ContractDto dto)
        {
            var result = await _contractService.CreateContractAsync(dto, User.GetUserId(), User.IsAdmin());
            if (!result.IsSuccess)
            {
                throw new BadRequestException(result.Message);
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.Id },
                result.Data);
        }

        // 5. PUT /api/contracts/{id} (Admin hoặc chính Chủ nhà sở hữu hợp đồng)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Owner,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] ContractDto dto)
        {
            var result = await _contractService.UpdateContractAsync(id, dto, User.GetUserId(), User.IsAdmin());
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

        // 6. DELETE /api/contracts/{id} (Chỉ Admin)
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
