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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto login)
        {
            var token = await _authService.LoginAsync(login);

            if (token == null)
            {
                throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác.");
            }

            return Ok(new
            {
                message = "Đăng nhập thành công",
                token = token
            });
        }

        // 1. Endpoint bảo mật bằng [Authorize] - nếu chưa gửi Token sẽ trả về 401 Unauthorized
        [Authorize]
        [HttpGet("secure-test")]
        public IActionResult SecureTest()
        {
            return Ok(new
            {
                message = "Bạn đã truy cập thành công vào Endpoint bảo mật với Token hợp lệ!"
            });
        }

        // 4. Đọc ngược thông tin từ Token bằng User.FindFirst()
        // Hiển thị: "Xin chào [Username], bạn đang ở nhóm [Role]"
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

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new
            {
                message = "Xác thực token thành công!",
                id = userId,
                username = username,
                role = role
            });
        }
    }
}
