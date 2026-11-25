using System.Security.Cryptography;
using System.Text;
using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Models;
using APIDemo.Repositories;

namespace APIDemo.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;

        public UserService(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<PageResult<UserResponseDto>> GetAllAsync(UserQueryParameters queryParams)
        {
            var pagedUsers = await _userRepo.GetAllAsync(queryParams);

            // Map danh sách Entity sang DTO
            var mappedItems = pagedUsers.Items.Select(MapToResponseDto).ToList();

            // Trả về PagedResult chứa DTO kèm đầy đủ Metadata
            return new PageResult<UserResponseDto>(
                mappedItems,
                pagedUsers.TotalCount,
                pagedUsers.PageNumber,
                pagedUsers.PageSize
            );
        }

        public async Task<UserResponseDto?> GetByIdAsync(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            return user == null ? null : MapToResponseDto(user);
        }

        public async Task<(bool IsSuccess, string Message, UserResponseDto? Data)> RegisterAsync(UserRegisterDto request)
        {
            var existingUser = await _userRepo.GetByUsernameOrEmailAsync(request.Username, request.Email);
            if (existingUser != null)
            {
                return (false, "Username hoặc Email đã được sử dụng.", null);
            }

            CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = string.IsNullOrEmpty(request.Role) ? "User" : request.Role,
                FullName = request.FullName,
                Phone = request.Phone,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepo.AddAsync(newUser);
            await _userRepo.SaveChangesAsync();

            return (true, "Đăng ký thành công", MapToResponseDto(newUser));
        }

        public async Task<(bool IsSuccess, string Message)> UpdateAsync(int id, UserRegisterDto request)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
            {
                return (false, $"Không tìm thấy người dùng có Id = {id}");
            }

            if (!string.IsNullOrEmpty(request.Email)) user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Role)) user.Role = request.Role;
            if (!string.IsNullOrEmpty(request.Username)) user.Username = request.Username;

            if (!string.IsNullOrEmpty(request.Password))
            {
                CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);
                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
            }

            _userRepo.Update(user);
            await _userRepo.SaveChangesAsync();

            return (true, $"Cập nhật thành công người dùng Id = {id}");
        }

        public async Task<(bool IsSuccess, string Message)> DeleteAsync(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
            {
                return (false, $"Không tìm thấy người dùng có Id = {id}");
            }

            _userRepo.Delete(user);
            await _userRepo.SaveChangesAsync();

            return (true, $"Đã xóa người dùng Id = {id}");
        }

        // Helper Private Methods
        private static UserResponseDto MapToResponseDto(User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            Department = user.Department,
            DateOfBirth = user.DateOfBirth,
            CreatedAt = user.CreatedAt
        };

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }
    }
}