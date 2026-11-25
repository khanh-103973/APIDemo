using Microsoft.EntityFrameworkCore;

namespace APIDemo.Data
{
    public static class TransactionHelper
    {
        /// <summary>
        /// Thực thi chuỗi thao tác ghi nhiều bảng trong 1 Transaction nguyên tử trên SQL Server
        /// (bỏ qua BeginTransaction trên InMemory provider khi chạy test).
        /// </summary>
        public static async Task ExecuteInTransactionAsync(AppDbContext dbContext, Func<Task> operation)
        {
            if (!dbContext.Database.IsRelational())
            {
                await operation();
                return;
            }

            var strategy = dbContext.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await dbContext.Database.BeginTransactionAsync();
                try
                {
                    await operation();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }
    }
}
