using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Exceptions;
using APIDemo.Security;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    public class UpdateUserStatusDto
    {
        public bool IsActive { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PageResult<UserResponseDto>>> GetAll([FromQuery] UserQueryParameters queryParams)
        {
            var result = await _userService.GetAllAsync(queryParams);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserResponseDto>> GetById(int id)
        {
            var currentUserId = User.GetUserId();
            if (!User.IsAdmin() && currentUserId != id)
            {
                throw new ForbiddenException("Bạn chỉ có quyền xem thông tin tài khoản của chính mình.");
            }

            var user = await _userService.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy người dùng có Id = {id}");

            return Ok(user);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserRegisterDto request)
        {
            var currentUserId = User.GetUserId();
            var isAdmin = User.IsAdmin();
            if (!isAdmin && currentUserId != id)
            {
                throw new ForbiddenException("Bạn chỉ có quyền cập nhật thông tin tài khoản của chính mình.");
            }

            var result = await _userService.UpdateAsync(id, request, allowRoleUpdate: isAdmin);
            if (!result.IsSuccess)
                throw new BadRequestException(result.Message);

            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Khóa hoặc mở khóa tài khoản người dùng (Admin). Khi khóa sẽ thu hồi ngay toàn bộ Refresh Token.
        /// </summary>
        [HttpPatch("{id:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusDto dto)
        {
            if (id == User.GetUserId() && !dto.IsActive)
            {
                throw new BadRequestException("Không thể tự khóa tài khoản Admin đang đăng nhập.");
            }

            var result = await _userService.SetActiveStatusAsync(id, dto.IsActive);
            if (!result.IsSuccess)
            {
                if (result.IsNotFound)
                    throw new NotFoundException(result.Message);

                throw new BadRequestException(result.Message);
            }

            return Ok(new { message = result.Message, isActive = dto.IsActive });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userService.DeleteAsync(id);
            if (!result.IsSuccess)
                throw new NotFoundException(result.Message);

            return Ok(new { message = result.Message });
        }
    }
}
