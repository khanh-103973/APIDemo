using System.Security.Claims;
using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Security;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        public const string AccessTokenCookieName = "hr_access_token";
        public const string RefreshTokenCookieName = "hr_refresh_token";

        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _environment;

        public AuthController(IAuthService authService, IWebHostEnvironment environment)
        {
            _authService = authService;
            _environment = environment;
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
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var (response, refreshToken, refreshExpiresAt) = await _authService.RegisterAsync(dto, clientIp);
            SetAuthCookies(response.Token, response.ExpiresAt, refreshToken, refreshExpiresAt);
            return StatusCode(StatusCodes.Status201Created, response);
        }

        /// <summary>
        /// Đăng nhập hệ thống bằng Username/Email và Password (bảo vệ bằng Rate Limiting + HttpOnly Cookie + Refresh Token)
        /// </summary>
        [HttpPost("login")]
        [EnableRateLimiting("AuthLoginPolicy")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.LoginAsync(login, clientIp);

            if (result == null)
            {
                throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không chính xác.");
            }

            var (response, refreshToken, refreshExpiresAt) = result.Value;
            SetAuthCookies(response.Token, response.ExpiresAt, refreshToken, refreshExpiresAt);
            return Ok(response);
        }

        /// <summary>
        /// Làm mới Access Token thông qua Refresh Token Rotation (đọc từ HttpOnly cookie hoặc body tùy chọn)
        /// </summary>
        [HttpPost("refresh")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh([FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] RefreshTokenRequestDto? dto = null)
        {
            var incomingRefresh = Request.Cookies[RefreshTokenCookieName] ?? dto?.RefreshToken;
            if (string.IsNullOrWhiteSpace(incomingRefresh))
            {
                throw new UnauthorizedException("Không tìm thấy Refresh Token hợp lệ.");
            }

            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var (response, newRefreshToken, refreshExpiresAt) = await _authService.RefreshAsync(incomingRefresh, clientIp);
            SetAuthCookies(response.Token, response.ExpiresAt, newRefreshToken, refreshExpiresAt);
            return Ok(response);
        }

        /// <summary>
        /// Đăng xuất, thu hồi Refresh Token trong DB và xóa toàn bộ HttpOnly cookie xác thực
        /// </summary>
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout([FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] RefreshTokenRequestDto? dto = null)
        {
            var incomingRefresh = Request.Cookies[RefreshTokenCookieName] ?? dto?.RefreshToken;
            int? userId = null;
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(idClaim, out var parsedId))
            {
                userId = parsedId;
            }

            await _authService.LogoutAsync(incomingRefresh, userId);
            ClearAuthCookies();
            return Ok(new { message = "Đăng xuất thành công và đã thu hồi phiên làm việc." });
        }

        /// <summary>
        /// Đổi mật khẩu tài khoản đang đăng nhập và thu hồi toàn bộ Refresh Token cũ trên các thiết bị
        /// </summary>
        [Authorize]
        [HttpPost("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            await _authService.ChangePasswordAsync(User.GetUserId(), dto);
            ClearAuthCookies();
            return Ok(new
            {
                message = "Đổi mật khẩu thành công. Toàn bộ phiên đăng nhập cũ đã được thu hồi, vui lòng đăng nhập lại."
            });
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
        /// Lấy thông tin chi tiết của người dùng đang đăng nhập
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

        private void SetAuthCookies(
            string accessToken,
            DateTime accessExpiresAt,
            string refreshToken,
            DateTime refreshExpiresAt)
        {
            var isSecure = !_environment.IsDevelopment() || Request.IsHttps;

            Response.Cookies.Append(AccessTokenCookieName, accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = isSecure,
                SameSite = SameSiteMode.Lax,
                Expires = accessExpiresAt,
                Path = "/"
            });

            Response.Cookies.Append(RefreshTokenCookieName, refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = isSecure,
                SameSite = SameSiteMode.Lax,
                Expires = refreshExpiresAt,
                Path = "/api/auth"
            });
        }

        private void ClearAuthCookies()
        {
            var isSecure = !_environment.IsDevelopment() || Request.IsHttps;
            Response.Cookies.Delete(AccessTokenCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = isSecure,
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });
            Response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = isSecure,
                SameSite = SameSiteMode.Lax,
                Path = "/api/auth"
            });
        }
    }
}
