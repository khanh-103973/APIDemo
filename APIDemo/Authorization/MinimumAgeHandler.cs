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
            var dateOfBirthClaim = context.User.FindFirst("DateOfBirth")
                ?? context.User.FindFirst(ClaimTypes.DateOfBirth);

            if (dateOfBirthClaim == null)
            {
                return Task.CompletedTask;
            }

            if (DateTime.TryParse(dateOfBirthClaim.Value, out var dateOfBirth))
            {
                var calculatedAge = DateTime.Today.Year - dateOfBirth.Year;
                if (dateOfBirth.Date > DateTime.Today.AddYears(-calculatedAge))
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
