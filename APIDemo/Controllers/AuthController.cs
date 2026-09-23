using APIDemo.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login(LoginDto login)
        {
            if (login.Username == "admin" &&
                login.Password == "123456")
            {
                return Ok(new
                {
                    message = "Login successful"
                });
            }

            return Unauthorized(new
            {
                message = "Invalid username or password"
            });
        }
    }
}