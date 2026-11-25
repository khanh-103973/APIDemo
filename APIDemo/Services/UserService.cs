using APIDemo.DTOs;
using APIDemo.DTOs.Common;
using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Repositories;
using APIDemo.Security;

namespace APIDemo.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        private readonly IAuthRepository _authRepo;

        public UserService(IUserRepository userRepo, IAuthRepository authRepo)
        {
            _userRepo = userRepo;
            _authRepo = authRepo;
        }

        public async Task<PageResult<UserResponseDto>> GetAllAsync(UserQueryParameters queryParams)
        {
            var pagedUsers = await _userRepo.GetAllAsync(queryParams);
            var mappedItems = pagedUsers.Items.Select(MapToResponseDto).ToList();

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
            // Chặn tự đăng ký vai trò Admin / Manager / Staff
            var safeRole = AuthService.ValidatePublicRegistrationRole(request.Role);

            var existingUser = await _userRepo.GetByUsernameOrEmailAsync(
                request.Username.Trim(),
                request.Email.Trim().ToLowerInvariant());
            if (existingUser != null)
            {
                return (false, "Username hoặc Email đã được sử dụng.", null);
            }

            PasswordHasher.CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var newUser = new User
            {
                Username = request.Username.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = safeRole,
                Department = "General",
                FullName = request.FullName.Trim(),
                Phone = request.Phone.Trim(),
                DateOfBirth = request.DateOfBirth,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepo.AddAsync(newUser);
            await _userRepo.SaveChangesAsync();

            return (true, "Đăng ký thành công", MapToResponseDto(newUser));
        }

        public async Task<(bool IsSuccess, string Message)> UpdateAsync(int id, UserRegisterDto request, bool allowRoleUpdate = false)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
            {
                return (false, $"Không tìm thấy người dùng có Id = {id}");
            }

            // Chặn leo thang quyền (Role / Department) khi người gọi không phải Admin
            if (!allowRoleUpdate)
            {
                if (!string.IsNullOrWhiteSpace(request.Role) &&
                    !request.Role.Trim().Equals(user.Role, StringComparison.OrdinalIgnoreCase))
                {
                    throw new ForbiddenException("Chỉ Quản trị viên (Admin) mới có quyền thay đổi vai trò (Role) của tài khoản.");
                }

                if (!string.IsNullOrWhiteSpace(request.Department) &&
                    !request.Department.Trim().Equals(user.Department, StringComparison.OrdinalIgnoreCase))
                {
                    throw new ForbiddenException("Chỉ Quản trị viên (Admin) mới có quyền thay đổi phòng ban (Department).");
                }
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(request.Role)) user.Role = request.Role.Trim();
                if (!string.IsNullOrWhiteSpace(request.Department)) user.Department = request.Department.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Email)) user.Email = request.Email.Trim().ToLowerInvariant();
            if (!string.IsNullOrWhiteSpace(request.Username)) user.Username = request.Username.Trim();
            if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(request.Phone)) user.Phone = request.Phone.Trim();
            if (request.DateOfBirth.HasValue) user.DateOfBirth = request.DateOfBirth;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                PasswordHasher.CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);
                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
            }

            _userRepo.Update(user);
            await _userRepo.SaveChangesAsync();

            return (true, $"Cập nhật thành công người dùng Id = {id}");
        }

        public async Task<(bool IsSuccess, bool IsNotFound, string Message)> SetActiveStatusAsync(int id, bool isActive)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
            {
                return (false, true, $"Không tìm thấy người dùng có Id = {id}");
            }

            user.IsActive = isActive;
            _userRepo.Update(user);
            await _userRepo.SaveChangesAsync();

            if (!isActive)
            {
                // Thu hồi ngay lập tức toàn bộ Refresh Token của tài khoản bị khóa
                await _authRepo.RevokeAllUserRefreshTokensAsync(id);
            }

            return (true, false, isActive
                ? $"Đã mở khóa tài khoản Id = {id}."
                : $"Đã khóa tài khoản Id = {id} và thu hồi toàn bộ phiên đăng nhập.");
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
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
