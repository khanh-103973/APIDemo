using APIDemo.Data;
using APIDemo.DTOs;
using APIDemo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Nhận AppDbContext từ hệ thống để kết nối CSDL SQL Server
        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách Users từ SQL Server
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? role)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(u => u.Role == role);
            }

            var users = await query.ToListAsync();
            return Ok(users);
        }

        // 2. Lấy chi tiết 1 User theo Id
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user is null)
            {
                return NotFound(new { message = $"Khong tim thay nguoi dung Id = {id}" });
            }

            return Ok(user);
        }

        // 3. Thêm User mới và lưu vào SQL Server
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserDto dto)
        {
            var user = new User
            {
                Username = dto.Username,
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password,
                Phone = dto.Phone,
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "Tenant" : dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // <-- Lệnh lưu thật vào SQL Server

            return CreatedAtAction(
                nameof(GetById),
                new { id = user.Id },
                user);
        }

        // 4. Cập nhật User trong SQL Server
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user is null)
            {
                return NotFound(new { message = $"Khong tim thay nguoi dung Id = {id}" });
            }

            user.Username = dto.Username;
            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Password = dto.Password;
            user.Phone = dto.Phone;
            user.Role = string.IsNullOrWhiteSpace(dto.Role) ? user.Role : dto.Role;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 5. Xóa User khỏi SQL Server
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user is null)
            {
                return NotFound(new { message = $"Khong tim thay nguoi dung Id = {id}" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}