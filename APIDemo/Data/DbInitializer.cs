using APIDemo.Models;
using APIDemo.Security;

namespace APIDemo.Data
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            // 1. Tự động Seed Users chuẩn băm PBKDF2-HMAC-SHA512 (mật khẩu mặc định: "123456")
            if (!context.Users.Any())
            {
                PasswordHasher.CreatePasswordHash("123456", out byte[] hash, out byte[] salt);

                var users = new List<User>
                {
                    new User
                    {
                        Username = "admin",
                        FullName = "Quản Trị Viên",
                        Email = "admin@rental.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Phone = "0900000001",
                        Role = "Admin",
                        Department = "IT",
                        DateOfBirth = new DateTime(1990, 1, 1),
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "owner_nam",
                        FullName = "Nguyễn Văn Nam",
                        Email = "nam.owner@gmail.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Phone = "0912345678",
                        Role = "Owner",
                        Department = "RealEstate",
                        DateOfBirth = new DateTime(1985, 5, 15),
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "owner_hoa",
                        FullName = "Trần Thị Hoa",
                        Email = "hoa.owner@gmail.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Phone = "0987654321",
                        Role = "Owner",
                        Department = "RealEstate",
                        DateOfBirth = new DateTime(1988, 8, 20),
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "tenant_an",
                        FullName = "Lê Văn An",
                        Email = "an.tenant@gmail.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Phone = "0933112233",
                        Role = "Tenant",
                        Department = "General",
                        DateOfBirth = new DateTime(2000, 2, 10), // 26 tuổi (>= 18)
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "tenant_binh",
                        FullName = "Phạm Thanh Bình",
                        Email = "binh.tenant@gmail.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Phone = "0944556677",
                        Role = "Tenant",
                        Department = "General",
                        DateOfBirth = new DateTime(1998, 11, 25), // 28 tuổi (>= 18)
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "tenant_tre_em",
                        FullName = "Nguyễn Văn Nhí",
                        Email = "nhi.underage@gmail.com",
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Phone = "0966778899",
                        Role = "Tenant",
                        Department = "General",
                        DateOfBirth = new DateTime(2012, 6, 1), // 14 tuổi (< 18, test Policy AtLeast18 bị 403 Forbidden)
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.Users.AddRange(users);
                context.SaveChanges();
            }

            // 2. Tự động Seed Houses
            if (!context.Houses.Any())
            {
                var ownerNam = context.Users.FirstOrDefault(u => u.Username == "owner_nam") ?? context.Users.First();
                var ownerHoa = context.Users.FirstOrDefault(u => u.Username == "owner_hoa") ?? ownerNam;

                var houses = new List<House>
                {
                    new House
                    {
                        Title = "Căn hộ mini gần Đại học Đông Á - Hải Châu",
                        Description = "Phòng đầy đủ nội thất mới 100%, có bếp riêng, ban công thoáng mát, giờ giấc tự do, đi bộ 3 phút đến Đại học Đông Á.",
                        Address = "33 Xô Viết Nghệ Tĩnh, Quận Hải Châu, TP. Đà Nẵng",
                        Price = 4500000,
                        Area = 28,
                        Bedrooms = 1,
                        ImageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                        Status = "Available",
                        OwnerId = ownerNam.Id
                    },
                    new House
                    {
                        Title = "Nhà nguyên căn 2 phòng ngủ gần Biển Mỹ Khê",
                        Description = "Khu dân cư yên tĩnh gần biển Mỹ Khê và Cầu Rồng, phù hợp gia đình nhỏ hoặc nhóm sinh viên, có chỗ để xe rộng rãi.",
                        Address = "120 Võ Nguyên Giáp, Quận Sơn Trà, TP. Đà Nẵng",
                        Price = 9000000,
                        Area = 65,
                        Bedrooms = 2,
                        ImageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                        Status = "Rented",
                        OwnerId = ownerNam.Id
                    },
                    new House
                    {
                        Title = "Phòng trọ có gác lửng trung tâm Thanh Khê",
                        Description = "Phòng sạch sẽ, có gác lửng cao, điều hòa inverter, chỗ để xe miễn phí, gần đường Điện Biên Phủ và siêu thị Coopmart.",
                        Address = "215 Điện Biên Phủ, Quận Thanh Khê, TP. Đà Nẵng",
                        Price = 3200000,
                        Area = 22,
                        Bedrooms = 1,
                        ImageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
                        Status = "Available",
                        OwnerId = ownerHoa.Id
                    },
                    new House
                    {
                        Title = "Studio cao cấp gần ĐH Kinh Tế - Ngũ Hành Sơn",
                        Description = "Studio thiết kế hiện đại, cửa sổ lớn đón gió biển, khóa vân tay an ninh 24/7, cách Đại học Kinh tế Đà Nẵng 500m.",
                        Address = "68 Ngũ Hành Sơn, Quận Ngũ Hành Sơn, TP. Đà Nẵng",
                        Price = 5200000,
                        Area = 34,
                        Bedrooms = 1,
                        ImageUrl = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
                        Status = "Available",
                        OwnerId = ownerHoa.Id
                    }
                };

                context.Houses.AddRange(houses);
                context.SaveChanges();
            }

            // 3. Tự động Seed Bookings
            if (!context.Bookings.Any())
            {
                var tenantAn = context.Users.FirstOrDefault(u => u.Username == "tenant_an");
                var tenantBinh = context.Users.FirstOrDefault(u => u.Username == "tenant_binh");
                var house1 = context.Houses.FirstOrDefault(h => h.Title.Contains("mini"));
                var house2 = context.Houses.FirstOrDefault(h => h.Title.Contains("nguyên căn"));

                if (tenantAn != null && tenantBinh != null && house1 != null && house2 != null)
                {
                    var bookings = new List<Booking>
                    {
                        new Booking
                        {
                            UserId = tenantAn.Id,
                            HouseId = house1.Id,
                            StartDate = DateTime.UtcNow.AddDays(7),
                            EndDate = DateTime.UtcNow.AddMonths(6),
                            Status = "Pending"
                        },
                        new Booking
                        {
                            UserId = tenantBinh.Id,
                            HouseId = house2.Id,
                            StartDate = DateTime.UtcNow.AddMonths(-1),
                            EndDate = DateTime.UtcNow.AddMonths(11),
                            Status = "Approved"
                        }
                    };

                    context.Bookings.AddRange(bookings);
                    context.SaveChanges();
                }
            }

            // 4. Tự động Seed Contracts (Quan hệ 1-1 với Booking)
            if (!context.Contracts.Any())
            {
                var targetBooking = context.Bookings.FirstOrDefault(b => b.Status == "Approved")
                    ?? context.Bookings.FirstOrDefault();
                if (targetBooking != null)
                {
                    var bookedHouse = context.Houses.FirstOrDefault(h => h.Id == targetBooking.HouseId);
                    var monthlyRent = bookedHouse?.Price ?? 4500000;
                    var contract = new Contract
                    {
                        BookingId = targetBooking.Id,
                        MonthlyRent = monthlyRent,
                        Deposit = monthlyRent * 2,
                        StartDate = targetBooking.StartDate,
                        EndDate = targetBooking.EndDate,
                        Status = "Active"
                    };

                    context.Contracts.Add(contract);
                    context.SaveChanges();
                }
            }
        }
    }
}
