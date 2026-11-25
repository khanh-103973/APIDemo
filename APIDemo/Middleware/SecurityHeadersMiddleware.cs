namespace APIDemo.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHostEnvironment _env;

        public SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment env)
        {
            _next = next;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            context.Response.OnStarting(() =>
            {
                var headers = context.Response.Headers;
                headers["X-Content-Type-Options"] = "nosniff";
                headers["X-Frame-Options"] = "DENY";
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)";

                // Giữ Swagger UI hoạt động ở Development; áp CSP chặt cho mọi endpoint API & Production
                var isSwaggerPath = _env.IsDevelopment() &&
                    context.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase);

                if (!isSwaggerPath)
                {
                    headers["Content-Security-Policy"] =
                        "default-src 'none'; img-src 'self' data: https:; frame-ancestors 'none'; base-uri 'none'";
                }

                return Task.CompletedTask;
            });

            await _next(context);
        }
    }

    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            return app.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
}
