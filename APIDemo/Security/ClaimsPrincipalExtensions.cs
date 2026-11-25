using System.Security.Claims;
using APIDemo.Exceptions;

namespace APIDemo.Security
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var userId) || userId <= 0)
            {
                throw new UnauthorizedException("Token không hợp lệ hoặc thiếu thông tin định danh người dùng.");
            }
            return userId;
        }

        public static bool IsAdmin(this ClaimsPrincipal user)
        {
            return user.IsInRole("Admin");
        }

        public static bool IsOwnerOrManager(this ClaimsPrincipal user)
        {
            return user.IsInRole("Owner") || user.IsInRole("Manager");
        }
    }
}
