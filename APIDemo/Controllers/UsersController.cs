using APIDemo.DTOs;
using APIDemo.Models;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private static readonly List<User> _users = new()
        {
            new User
            {
                Id = 1,
                Username = "admin",
                FullName = "Quan tri vien",
                Email = "admin@gmail.com",
                Password = "123456",
                Phone = "0900000001",
                Role = "Admin"
            },
            new User
            {
                Id = 2,
                Username = "tenant01",
                FullName = "Nguyen Van An",
                Email = "an@gmail.com",
                Password = "123456",
                Phone = "0900000002",
                Role = "Tenant"
            },
            new User
            {
                Id = 3,
                Username = "owner01",
                FullName = "Tran Thi Binh",
                Email = "binh@gmail.com",
                Password = "123456",
                Phone = "0900000003",
                Role = "Owner"
            }
        };

        // GET /api/users
        [HttpGet]
        public IActionResult GetAll([FromQuery] string? role)
        {
            var users = _users.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                users = users.Where(u => u.Role.Equals(role, StringComparison.OrdinalIgnoreCase));
            }

            return Ok(users);
        }

        // GET /api/users/1
        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);

            if (user is null)
            {
                return NotFound(new { message = $"Khong tim thay nguoi dung Id = {id}" });
            }

            return Ok(user);
        }

        // POST /api/users
        [HttpPost]
        public IActionResult Create([FromBody] UserDto dto)
        {
            var user = new User
            {
                Id = _users.Any()
                    ? _users.Max(u => u.Id) + 1
                    : 1,
                Username = dto.Username,
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password,
                Phone = dto.Phone,
                Role = string.IsNullOrWhiteSpace(dto.Role)
                    ? "Tenant"
                    : dto.Role
            };

            _users.Add(user);

            return CreatedAtAction(
                nameof(GetById),
                new { id = user.Id },
                user);
        }

        // PUT /api/users/1
        [HttpPut("{id:int}")]
        public IActionResult Update(int id, [FromBody] UserDto dto)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);

            if (user is null)
            {
                return NotFound(new { message = $"Khong tim thay nguoi dung Id = {id}" });
            }

            user.Username = dto.Username;
            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Password = dto.Password;
            user.Phone = dto.Phone;
            user.Role = string.IsNullOrWhiteSpace(dto.Role)
                ? user.Role
                : dto.Role;

            return NoContent();
        }

        // DELETE /api/users/1
        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);

            if (user is null)
            {
                return NotFound(new { message = $"Khong tim thay nguoi dung Id = {id}" });
            }

            _users.Remove(user);

            return NoContent();
        }
    }
}
