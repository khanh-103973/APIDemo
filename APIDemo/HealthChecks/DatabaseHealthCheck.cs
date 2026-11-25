using APIDemo.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace APIDemo.HealthChecks
{
    public class DatabaseHealthCheck : IHealthCheck
    {
        private readonly AppDbContext _context;

        public DatabaseHealthCheck(AppDbContext context)
        {
            _context = context;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
                return canConnect
                    ? HealthCheckResult.Healthy("Kết nối cơ sở dữ liệu thành công.")
                    : HealthCheckResult.Unhealthy("Không thể kết nối tới cơ sở dữ liệu.");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy("Lỗi khi kiểm tra kết nối cơ sở dữ liệu.", ex);
            }
        }
    }
}
