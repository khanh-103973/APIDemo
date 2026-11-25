using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Filters;

namespace APIDemo.Filters
{
    /// <summary>
    /// Đánh dấu controller/action chỉ hoạt động ở môi trường Development.
    /// Kết hợp với DevelopmentOnlyControllerConvention để gỡ hoàn toàn khỏi bảng định tuyến (trả 404 trước cả AuthorizationMiddleware) khi chạy Production.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public sealed class DevelopmentOnlyAttribute : Attribute, IAuthorizationFilter, IOrderedFilter
    {
        public int Order => int.MinValue;

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var env = context.HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            if (!env.IsDevelopment())
            {
                context.Result = new NotFoundResult();
            }
        }
    }

    public sealed class DevelopmentOnlyControllerConvention : IApplicationModelConvention
    {
        private readonly IHostEnvironment _environment;

        public DevelopmentOnlyControllerConvention(IHostEnvironment environment)
        {
            _environment = environment;
        }

        public void Apply(ApplicationModel application)
        {
            if (_environment.IsDevelopment())
            {
                return;
            }

            foreach (var controller in application.Controllers)
            {
                var isDevOnlyController = controller.Attributes.OfType<DevelopmentOnlyAttribute>().Any();
                if (isDevOnlyController)
                {
                    controller.Actions.Clear();
                    continue;
                }

                for (var i = controller.Actions.Count - 1; i >= 0; i--)
                {
                    if (controller.Actions[i].Attributes.OfType<DevelopmentOnlyAttribute>().Any())
                    {
                        controller.Actions.RemoveAt(i);
                    }
                }
            }
        }
    }
}
