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

        public DbSet<User> Users { get; set; }

        public DbSet<House> Houses { get; set; }

        public DbSet<Booking> Bookings { get; set; }

        public DbSet<Contract> Contracts { get; set; }
    }
}
