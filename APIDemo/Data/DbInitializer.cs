using System.Security.Cryptography;
using System.Text;
using APIDemo.Models;

namespace APIDemo.Data
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            // 1. Seed Users
            if (!context.Users.Any())
            {
                CreatePasswordHash("123456", out byte[] hash, out byte[] salt);

                var users = new List<User>
                {
                    new User
                    {
                        Username = "admin",
                        FullName = "Hệ thống Quản trị",
                        Email = "admin@rental.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Role = "Admin",
                        Department = "IT",
                        DateOfBirth = new DateTime(1990, 1, 1),
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "manager",
                        FullName = "Quản lý Chi nhánh",
                        Email = "manager@rental.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Role = "Manager",
                        Department = "Management",
                        DateOfBirth = new DateTime(1992, 5, 15),
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "hr_user",
                        FullName = "Chuyên viên Nhân sự",
                        Email = "hr@rental.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Role = "Staff",
                        Department = "HR",
                        DateOfBirth = new DateTime(1995, 10, 20),
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "adult_user",
                        FullName = "Khách thuê trưởng thành",
                        Email = "adult@rental.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Role = "Tenant",
                        Department = "Sales",
                        DateOfBirth = new DateTime(2000, 6, 12),
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "young_user",
                        FullName = "Khách thuê vị thành niên",
                        Email = "young@rental.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Role = "Tenant",
                        Department = "Sales",
                        DateOfBirth = new DateTime(2015, 1, 1),
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.Users.AddRange(users);
                context.SaveChanges();
            }

            // 2. Seed Houses
            if (!context.Houses.Any())
            {
                var adminUser = context.Users.FirstOrDefault(u => u.Username == "admin");
                var managerUser = context.Users.FirstOrDefault(u => u.Username == "manager");
                int ownerId = adminUser?.Id ?? managerUser?.Id ?? context.Users.First().Id;

                var houses = new List<House>
                {
                    new House
                    {
                        Title = "Can ho mini gan truong dai hoc",
                        Description = "Phong day du noi that, co bep nho va nha ve sinh rieng.",
                        Address = "Quan 1, TP. Ho Chi Minh",
                        Price = 4500000,
                        Area = 28,
                        Bedrooms = 1,
                        ImageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                        Status = "Available",
                        OwnerId = ownerId
                    },
                    new House
                    {
                        Title = "Nha nguyen can 2 phong ngu",
                        Description = "Khu dan cu yen tinh, phu hop gia dinh nho.",
                        Address = "Quan Binh Thanh, TP. Ho Chi Minh",
                        Price = 9000000,
                        Area = 65,
                        Bedrooms = 2,
                        ImageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                        Status = "Rented",
                        OwnerId = ownerId
                    },
                    new House
                    {
                        Title = "Phong tro co gac lung",
                        Description = "Phong sach se, co cho de xe va gio giac tu do.",
                        Address = "Quan Go Vap, TP. Ho Chi Minh",
                        Price = 3200000,
                        Area = 22,
                        Bedrooms = 1,
                        ImageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
                        Status = "Available",
                        OwnerId = ownerId
                    }
                };

                context.Houses.AddRange(houses);
                context.SaveChanges();
            }

            // 3. Seed Bookings
            if (!context.Bookings.Any())
            {
                var tenant = context.Users.FirstOrDefault(u => u.Role == "Tenant") ?? context.Users.First();
                var house = context.Houses.FirstOrDefault();

                if (house != null)
                {
                    var bookings = new List<Booking>
                    {
                        new Booking
                        {
                            UserId = tenant.Id,
                            HouseId = house.Id,
                            StartDate = DateTime.UtcNow.AddDays(1),
                            EndDate = DateTime.UtcNow.AddMonths(6),
                            Status = "Pending"
                        }
                    };

                    context.Bookings.AddRange(bookings);
                    context.SaveChanges();
                }
            }

            // 4. Seed Categories & Products
            if (!context.Categories.Any())
            {
                var electronics = new Category { Name = "Điện tử & Gia dụng" };
                var furniture = new Category { Name = "Nội thất" };

                context.Categories.AddRange(electronics, furniture);
                context.SaveChanges();

                var products = new List<Product>
                {
                    new Product
                    {
                        Name = "Tủ lạnh Inverter 200L",
                        Price = 6500000,
                        CategoryId = electronics.Id
                    },
                    new Product
                    {
                        Name = "Máy giặt cửa trước 8.5kg",
                        Price = 8200000,
                        CategoryId = electronics.Id
                    },
                    new Product
                    {
                        Name = "Bàn làm việc gỗ sồi",
                        Price = 1800000,
                        CategoryId = furniture.Id
                    }
                };

                context.Products.AddRange(products);
                context.SaveChanges();
            }
        }

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}
