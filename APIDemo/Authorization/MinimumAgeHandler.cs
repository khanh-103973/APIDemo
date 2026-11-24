using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace APIDemo.Authorization
{
    public class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            MinimumAgeRequirement requirement)
        {
            // Tìm Claim DateOfBirth
            var dateOfBirthClaim = context.User.FindFirst(c =>
                c.Type == ClaimTypes.DateOfBirth || c.Type == "DateOfBirth");

            if (dateOfBirthClaim == null)
            {
                return Task.CompletedTask;
            }

            if (DateTime.TryParse(dateOfBirthClaim.Value, out var dateOfBirth))
            {
                var today = DateTime.Today;
                var calculatedAge = today.Year - dateOfBirth.Year;

                // Nếu chưa đến sinh nhật năm nay thì trừ đi 1 tuổi
                if (dateOfBirth.Date > today.AddYears(-calculatedAge))
                {
                    calculatedAge--;
                }

                if (calculatedAge >= requirement.MinimumAge)
                {
                    context.Succeed(requirement);
                }
            }

            return Task.CompletedTask;
        }
    }
}
