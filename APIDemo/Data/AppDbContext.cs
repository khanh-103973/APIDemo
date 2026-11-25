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

            // 2. Quan hệ Nhà - Chủ nhà (Owner - User)
            modelBuilder.Entity<House>()
                .HasOne(h => h.Owner)
                .WithMany(u => u.Houses)
                .HasForeignKey(h => h.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // 3. Quan hệ Đặt phòng - Người dùng (Booking - User)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. Quan hệ Đặt phòng - Nhà (Booking - House)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.House)
                .WithMany(h => h.Bookings)
                .HasForeignKey(b => b.HouseId)
                .OnDelete(DeleteBehavior.Restrict);

            // 5. Quan hệ 1-1: Hợp đồng - Đặt phòng (Contract - Booking)
            modelBuilder.Entity<Contract>()
                .HasOne(c => c.Booking)
                .WithOne(b => b.Contract)
                .HasForeignKey<Contract>(c => c.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
