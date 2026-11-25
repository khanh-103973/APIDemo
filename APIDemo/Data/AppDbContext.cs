using APIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<House> Houses { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<Contract> Contracts { get; set; } = null!;
        public DbSet<StoredFile> StoredFiles { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

        public override int SaveChanges()
        {
            ApplyAuditTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyAuditTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void ApplyAuditTimestamps()
        {
            var utcNow = DateTime.UtcNow;
            foreach (var entry in ChangeTracker.Entries<IAuditableSoftDelete>())
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity.CreatedAt == default)
                    {
                        entry.Entity.CreatedAt = utcNow;
                    }
                    entry.Entity.UpdatedAt = utcNow;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Property(e => e.CreatedAt).IsModified = false;
                    entry.Entity.UpdatedAt = utcNow;
                    if (entry.Entity.IsDeleted && !entry.Entity.DeletedAt.HasValue)
                    {
                        entry.Entity.DeletedAt = utcNow;
                    }
                }
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Chỉ mục Unique cho Username và Email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // 2. Quan hệ Nhà - Chủ nhà (Owner - User) + Global Soft Delete Filter
            modelBuilder.Entity<House>()
                .HasOne(h => h.Owner)
                .WithMany(u => u.Houses)
                .HasForeignKey(h => h.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<House>()
                .HasQueryFilter(h => !h.IsDeleted);

            // 3. Quan hệ Đặt phòng - Người dùng (Booking - User) + Global Soft Delete Filter
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasQueryFilter(b => !b.IsDeleted);

            // 4. Quan hệ Đặt phòng - Nhà (Booking - House)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.House)
                .WithMany(h => h.Bookings)
                .HasForeignKey(b => b.HouseId)
                .OnDelete(DeleteBehavior.Restrict);

            // 5. Quan hệ 1-1: Hợp đồng - Đặt phòng (Contract - Booking) + Global Soft Delete Filter
            modelBuilder.Entity<Contract>()
                .HasOne(c => c.Booking)
                .WithOne(b => b.Contract)
                .HasForeignKey<Contract>(c => c.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Contract>()
                .HasQueryFilter(c => !c.IsDeleted);

            // 6. RefreshToken cho cơ chế Refresh Token Rotation & Revocation
            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.TokenHash)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
