using APIDemo.DTOs;
using APIDemo.DTOs.Common; // 👈 1. Thêm using này để nhận diện PagedResult và UserQueryParameters
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
        [Authorize(Roles = "Admin")] // Chỉ tài khoản Role "Admin" mới được lấy danh sách (nếu muốn test nhanh trên Swagger mà không cần đăng nhập Admin thì bạn có thể tạm đóng comment dòng này lại)
        public async Task<ActionResult<PageResult<UserResponseDto>>> GetAll([FromQuery] UserQueryParameters queryParams)
        {
            var result = await _userService.GetAllAsync(queryParams);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserResponseDto>> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = $"Không tìm thấy người dùng có Id = {id}" });

            return Ok(user);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register([FromBody] UserRegisterDto request)
        {
            var result = await _userService.RegisterAsync(request);
            if (!result.IsSuccess)
                return BadRequest(new { message = result.Message });

            return Ok(result.Data);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserRegisterDto request)
        {
            var result = await _userService.UpdateAsync(id, request);
            if (!result.IsSuccess)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userService.DeleteAsync(id);
            if (!result.IsSuccess)
                return NotFound(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var token = await _authService.LoginAsync(dto);

            if (token == null)
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không chính xác." });

            return Ok(new { Token = token });
        }
    }
}