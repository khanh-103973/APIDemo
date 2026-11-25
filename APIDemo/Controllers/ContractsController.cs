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
        [ProducesResponseType(typeof(IEnumerable<ContractResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ContractResponseDto>>> GetAll([FromQuery] string? status)
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
        [ProducesResponseType(typeof(ContractResponseDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<ContractResponseDto>> GetById(int id)
        {
            var contract = await _contractService.GetContractByIdAsync(id, User.GetUserId(), User.IsAdmin())
                ?? throw new NotFoundException($"Không tìm thấy hợp đồng thuê nhà Id = {id}");

            return Ok(contract);
        }

        // 3. GET /api/contracts/booking/{bookingId} (Kiểm tra quyền sở hữu Tenant/Owner/Admin)
        [HttpGet("booking/{bookingId:int}")]
        [ProducesResponseType(typeof(ContractResponseDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<ContractResponseDto>> GetByBookingId(int bookingId)
        {
            var contract = await _contractService.GetContractByBookingIdAsync(bookingId, User.GetUserId(), User.IsAdmin())
                ?? throw new NotFoundException($"Không tìm thấy hợp đồng cho lịch đặt phòng Id = {bookingId}");

            return Ok(contract);
        }

        // 4. POST /api/contracts (Admin hoặc chính Chủ nhà của căn nhà trong Booking, >= 18 tuổi)
        [HttpPost]
        [Authorize(Roles = "Admin,Owner,Manager", Policy = "AtLeast18")]
        [ProducesResponseType(typeof(ContractResponseDto), StatusCodes.Status201Created)]
        public async Task<ActionResult<ContractResponseDto>> Create([FromBody] ContractDto dto)
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

        // 6. POST /api/contracts/{id}/sign (Khách thuê xác nhận ký hợp đồng Pending -> Active & House -> Rented)
        [HttpPost("{id:int}/sign")]
        public async Task<IActionResult> Sign(int id)
        {
            var result = await _contractService.SignContractAsync(id, User.GetUserId(), User.IsAdmin());
            if (!result.IsSuccess)
            {
                if (result.IsNotFound)
                {
                    throw new NotFoundException(result.Message);
                }

                throw new BadRequestException(result.Message);
            }

            return Ok(new { message = result.Message });
        }

        // 7. POST /api/contracts/{id}/reject (Khách thuê từ chối hợp đồng Pending -> Terminated & House -> Available)
        [HttpPost("{id:int}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var result = await _contractService.RejectContractAsync(id, User.GetUserId(), User.IsAdmin());
            if (!result.IsSuccess)
            {
                if (result.IsNotFound)
                {
                    throw new NotFoundException(result.Message);
                }

                throw new BadRequestException(result.Message);
            }

            return Ok(new { message = result.Message });
        }

        // 8. DELETE /api/contracts/{id} (Chỉ Admin)
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
