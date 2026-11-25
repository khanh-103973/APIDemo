using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Exceptions;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IAuthService _authService;

        public UsersController(IUserService userService, IAuthService authService)
        {
            _userService = userService;
            _authService = authService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PageResult<UserResponseDto>>> GetAll([FromQuery] UserQueryParameters queryParams)
        {
            var result = await _userService.GetAllAsync(queryParams);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<ActionResult<UserResponseDto>> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy người dùng có Id = {id}");

            return Ok(user);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register([FromBody] UserRegisterDto request)
        {
            var result = await _userService.RegisterAsync(request);
            if (!result.IsSuccess)
                throw new BadRequestException(result.Message);

            return Ok(result.Data);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Owner")]
        public async Task<IActionResult> Update(int id, [FromBody] UserRegisterDto request)
        {
            var result = await _userService.UpdateAsync(id, request);
            if (!result.IsSuccess)
                throw new BadRequestException(result.Message);

            return Ok(new { message = result.Message });
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var auth = await _authService.LoginAsync(dto)
                ?? throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không chính xác.");

            return Ok(auth);
        }
    }
}
