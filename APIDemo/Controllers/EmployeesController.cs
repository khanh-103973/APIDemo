using APIDemo.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [DevelopmentOnly]
    public class EmployeesController : ControllerBase
    {
        // 3. API yêu cầu Policy MustBeHR (Claim Department = "HR")
        [HttpGet]
        [Authorize(Policy = "MustBeHR")]
        public IActionResult GetEmployees()
        {
            var employees = new[]
            {
                new { Id = 1, FullName = "Nguyen Van A", Department = "HR", Position = "HR Specialist" },
                new { Id = 2, FullName = "Tran Thi B", Department = "HR", Position = "HR Lead" },
                new { Id = 3, FullName = "Le Van C", Department = "HR", Position = "Recruiter" }
            };

            return Ok(new
            {
                message = "Truy cập danh sách nhân viên thành công với Policy MustBeHR!",
                data = employees
            });
        }

        // 5. API yêu cầu Policy AtLeast18 (Độ tuổi >= 18 từ Claim DateOfBirth)
        [HttpGet("adults-only")]
        [Authorize(Policy = "AtLeast18")]
        public IActionResult GetAdultContent()
        {
            return Ok(new
            {
                message = "Xác thực thành công! Bạn đủ 18 tuổi để truy cập API này (MinimumAgeRequirement)."
            });
        }
    }
}
