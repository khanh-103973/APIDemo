using System.Security.Claims;
using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Đăng ký tài khoản mới cho người dùng (Khách thuê hoặc Chủ nhà)
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Đăng nhập hệ thống bằng Username và Password
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var result = await _authService.LoginAsync(login);

            if (result == null)
            {
                throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không chính xác.");
            }

            return Ok(result);
        }

        /// <summary>
        /// Kiểm tra token JWT bảo mật
        /// </summary>
        [Authorize]
        [HttpGet("secure-test")]
        public IActionResult SecureTest()
        {
            return Ok(new
            {
                message = "Bạn đã truy cập thành công vào Endpoint bảo mật với Token hợp lệ!"
            });
        }

        /// <summary>
        /// Lấy lời chào kèm Role của User đang đăng nhập
        /// </summary>
        [Authorize]
        [HttpGet("greeting")]
        public IActionResult GetGreeting()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Ẩn danh";
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Chưa phân quyền";

            return Ok(new
            {
                message = $"Xin chào {username}, bạn đang ở nhóm {role}",
                username = username,
                role = role
            });
        }

        /// <summary>
        /// Lấy thông tin chi tiết của người dùng đang đăng nhập (Frontend dùng khi F5 hoặc nạp trang)
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
            var department = User.FindFirst("Department")?.Value ?? "General";
            var dateOfBirth = User.FindFirst("DateOfBirth")?.Value;
            var id = int.TryParse(userIdStr, out var parsedId) ? parsedId : 0;

            var userObj = new
            {
                id = id,
                username = username,
                role = role,
                department = department,
                dateOfBirth = dateOfBirth
            };

            return Ok(new
            {
                message = "Xác thực token thành công!",
                id = id,
                username = username,
                role = role,
                department = department,
                dateOfBirth = dateOfBirth,
                user = userObj
            });
        }
    }
}
