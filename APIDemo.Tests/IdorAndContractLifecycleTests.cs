using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using APIDemo.Data;
using APIDemo.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace APIDemo.Tests
{
    public class IdorAndContractLifecycleTests
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        [Fact]
        public async Task ClosedLoopContractLifecycle_AndDoubleBookingGuard_WorkEndToEnd()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient();

            // 1. Register Owner + 2 Tenants
            var ownerAuth = await RegisterAsync(client, "owner_life", "Owner", "1990-01-01");
            var tenant1Auth = await RegisterAsync(client, "tenant_life_1", "Tenant", "1996-02-02");
            var tenant2Auth = await RegisterAsync(client, "tenant_life_2", "Tenant", "1997-03-03");

            // 2. Owner creates a new Available house
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            var houseRes = await client.PostAsJsonAsync("/api/houses", new
            {
                title = "Căn hộ test vòng đời hợp đồng Đà Nẵng",
                description = "Mô tả chi tiết căn hộ đầy đủ tiện nghi tại Quận Hải Châu Đà Nẵng.",
                address = "33 Xô Viết Nghệ Tĩnh, Quận Hải Châu, TP. Đà Nẵng",
                price = 5000000,
                area = 35,
                bedrooms = 1,
                imageUrl = "",
                status = "Available",
                ownerId = ownerAuth.User.Id
            });
            Assert.Equal(HttpStatusCode.Created, houseRes.StatusCode);
            var house = await houseRes.Content.ReadFromJsonAsync<HouseResponseDto>(JsonOptions);
            Assert.NotNull(house);

            // 3. Tenant 1 books the house
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tenant1Auth.Token);
            var startDate = DateTime.UtcNow.AddDays(2);
            var endDate = startDate.AddMonths(6);
            var bookingRes = await client.PostAsJsonAsync("/api/bookings", new
            {
                userId = tenant1Auth.User.Id,
                houseId = house!.Id,
                startDate,
                endDate
            });
            Assert.Equal(HttpStatusCode.Created, bookingRes.StatusCode);
            var booking = await bookingRes.Content.ReadFromJsonAsync<BookingResponseDto>(JsonOptions);
            Assert.NotNull(booking);

            // 4. Tenant 1 CANNOT self-approve booking (403 Forbidden)
            var selfApprove = await client.PutAsJsonAsync($"/api/bookings/{booking!.Id}", new
            {
                userId = tenant1Auth.User.Id,
                houseId = house.Id,
                startDate,
                endDate,
                status = "Approved"
            });
            Assert.Equal(HttpStatusCode.Forbidden, selfApprove.StatusCode);

            // 5. Tenant 2 CANNOT read Tenant 1's booking (IDOR -> 403)
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tenant2Auth.Token);
            var idorBooking = await client.GetAsync($"/api/bookings/{booking.Id}");
            Assert.Equal(HttpStatusCode.Forbidden, idorBooking.StatusCode);

            // 6. Owner marks booking Completed -> auto-creates Pending Contract
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            var completeRes = await client.PutAsJsonAsync($"/api/bookings/{booking.Id}", new
            {
                userId = tenant1Auth.User.Id,
                houseId = house.Id,
                startDate,
                endDate,
                status = "Completed"
            });
            Assert.Equal(HttpStatusCode.NoContent, completeRes.StatusCode);

            var contractRes = await client.GetAsync($"/api/contracts/booking/{booking.Id}");
            Assert.Equal(HttpStatusCode.OK, contractRes.StatusCode);
            var contract = await contractRes.Content.ReadFromJsonAsync<ContractResponseDto>(JsonOptions);
            Assert.NotNull(contract);
            Assert.Equal("Pending", contract!.Status);

            // 7. Tenant 2 CANNOT sign Tenant 1's contract (IDOR -> 403)
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tenant2Auth.Token);
            var wrongSigner = await client.PostAsync($"/api/contracts/{contract.Id}/sign", null);
            Assert.Equal(HttpStatusCode.Forbidden, wrongSigner.StatusCode);

            // 8. Tenant 1 signs contract -> Contract=Active & House=Rented
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tenant1Auth.Token);
            var signRes = await client.PostAsync($"/api/contracts/{contract.Id}/sign", null);
            Assert.Equal(HttpStatusCode.OK, signRes.StatusCode);

            var rentedHouse = await client.GetFromJsonAsync<HouseResponseDto>($"/api/houses/{house.Id}", JsonOptions);
            Assert.Equal("Rented", rentedHouse!.Status);

            // 9. Double-booking guard: Tenant 2 trying to book a Rented house gets 409 Conflict
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tenant2Auth.Token);
            var doubleBookRes = await client.PostAsJsonAsync("/api/bookings", new
            {
                userId = tenant2Auth.User.Id,
                houseId = house.Id,
                startDate = startDate.AddDays(5),
                endDate = endDate.AddDays(5)
            });
            Assert.Equal(HttpStatusCode.Conflict, doubleBookRes.StatusCode);

            // 10. Owner terminates contract -> House automatically reopens to Available
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            var termRes = await client.PutAsJsonAsync($"/api/contracts/{contract.Id}", new
            {
                bookingId = booking.Id,
                monthlyRent = 5000000,
                deposit = 5000000,
                startDate,
                endDate,
                status = "Terminated"
            });
            Assert.Equal(HttpStatusCode.NoContent, termRes.StatusCode);

            var reopenedHouse = await client.GetFromJsonAsync<HouseResponseDto>($"/api/houses/{house.Id}", JsonOptions);
            Assert.Equal("Available", reopenedHouse!.Status);
        }

        [Fact]
        public async Task FileUpload_ValidatesMagicBytes_AndBlocksIdorDownload()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient();

            var ownerAuth = await RegisterAsync(client, "owner_file", "Owner", "1990-01-01");
            var otherUserAuth = await RegisterAsync(client, "other_file", "Tenant", "1995-01-01");

            // 1. Fake .jpg with text content is rejected by Magic Bytes validator (400)
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            using (var fakeForm = new MultipartFormDataContent())
            {
                var fakeContent = new ByteArrayContent(Encoding.UTF8.GetBytes("this is not a real jpeg image"));
                fakeContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                fakeForm.Add(fakeContent, "file", "malicious.jpg");

                var fakeRes = await client.PostAsync("/api/files/upload-image", fakeForm);
                Assert.Equal(HttpStatusCode.BadRequest, fakeRes.StatusCode);
            }

            // 2. Real PNG magic bytes succeeds (200)
            using (var validForm = new MultipartFormDataContent())
            {
                byte[] pngHeader = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D };
                var validContent = new ByteArrayContent(pngHeader);
                validContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
                validForm.Add(validContent, "file", "valid.png");

                var validRes = await client.PostAsync("/api/files/upload-image", validForm);
                Assert.Equal(HttpStatusCode.OK, validRes.StatusCode);
            }

            // 3. StoredFile DB upload -> Owner can download (200), Other User gets 403 Forbidden (IDOR blocked)
            int uploadedId;
            using (var dbForm = new MultipartFormDataContent())
            {
                var txtContent = new ByteArrayContent(Encoding.UTF8.GetBytes($"Private contract doc {Guid.NewGuid()}"));
                txtContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
                dbForm.Add(txtContent, "File", "private_doc.txt");

                var dbRes = await client.PostAsync("/api/files/upload", dbForm);
                Assert.Equal(HttpStatusCode.OK, dbRes.StatusCode);
                var json = await dbRes.Content.ReadFromJsonAsync<JsonElement>();
                uploadedId = json.GetProperty("id").GetInt32();
            }

            var ownerDownload = await client.GetAsync($"/api/files/download/{uploadedId}");
            Assert.Equal(HttpStatusCode.OK, ownerDownload.StatusCode);

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", otherUserAuth.Token);
            var otherDownload = await client.GetAsync($"/api/files/download/{uploadedId}");
            Assert.Equal(HttpStatusCode.Forbidden, otherDownload.StatusCode);
        }

        [Fact]
        public async Task Booking_RejectsOverlappingApprovedDateRange_With409Conflict()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient();

            var ownerAuth = await RegisterAsync(client, "owner_ovlp", "Owner", "1990-01-01");
            var tenant1Auth = await RegisterAsync(client, "tenant_ovlp_1", "Tenant", "1995-05-05");
            var tenant2Auth = await RegisterAsync(client, "tenant_ovlp_2", "Tenant", "1996-06-06");

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            var houseRes = await client.PostAsJsonAsync("/api/houses", new
            {
                title = "Phòng test chống đặt trùng lịch Đà Nẵng",
                description = "Phòng thoáng mát đầy đủ tiện nghi gần trung tâm Hải Châu.",
                address = "100 Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng",
                price = 4800000,
                area = 30,
                bedrooms = 1,
                imageUrl = "",
                status = "Available",
                ownerId = ownerAuth.User.Id
            });
            var house = await houseRes.Content.ReadFromJsonAsync<HouseResponseDto>(JsonOptions);
            Assert.NotNull(house);

            // Tenant 1 books [day+10 .. day+40] and Owner approves it
            var start1 = DateTime.UtcNow.AddDays(10);
            var end1 = DateTime.UtcNow.AddDays(40);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tenant1Auth.Token);
            var bk1Res = await client.PostAsJsonAsync("/api/bookings", new
            {
                userId = tenant1Auth.User.Id,
                houseId = house!.Id,
                startDate = start1,
                endDate = end1
            });
            Assert.Equal(HttpStatusCode.Created, bk1Res.StatusCode);
            var bk1 = await bk1Res.Content.ReadFromJsonAsync<BookingResponseDto>(JsonOptions);

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            var approveRes = await client.PutAsJsonAsync($"/api/bookings/{bk1!.Id}", new
            {
                userId = tenant1Auth.User.Id,
                houseId = house.Id,
                startDate = start1,
                endDate = end1,
                status = "Approved"
            });
            Assert.Equal(HttpStatusCode.NoContent, approveRes.StatusCode);

            // Tenant 2 tries overlapping range [day+20 .. day+50] -> 409 Conflict
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tenant2Auth.Token);
            var overlapRes = await client.PostAsJsonAsync("/api/bookings", new
            {
                userId = tenant2Auth.User.Id,
                houseId = house.Id,
                startDate = DateTime.UtcNow.AddDays(20),
                endDate = DateTime.UtcNow.AddDays(50)
            });
            Assert.Equal(HttpStatusCode.Conflict, overlapRes.StatusCode);

            // Tenant 2 tries non-overlapping range [day+45 .. day+90] -> 201 Created
            var nonOverlapRes = await client.PostAsJsonAsync("/api/bookings", new
            {
                userId = tenant2Auth.User.Id,
                houseId = house.Id,
                startDate = DateTime.UtcNow.AddDays(45),
                endDate = DateTime.UtcNow.AddDays(90)
            });
            Assert.Equal(HttpStatusCode.Created, nonOverlapRes.StatusCode);
        }

        [Fact]
        public async Task SoftDelete_PreservesDatabaseRecord_AndPopulatesAuditTimestamps()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient();

            var ownerAuth = await RegisterAsync(client, "owner_soft", "Owner", "1990-01-01");
            var tenantAuth = await RegisterAsync(client, "tenant_soft", "Tenant", "1996-01-01");
            var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new { username = "admin", password = "123456" });
            var adminAuth = await adminLogin.Content.ReadFromJsonAsync<AuthResponseDto>(JsonOptions);

            // Create House & check audit timestamps
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            var houseRes = await client.PostAsJsonAsync("/api/houses", new
            {
                title = "Nhà test Soft Delete và Audit Timestamps",
                description = "Mô tả căn nhà dùng để kiểm chứng xóa mềm trong SQL/EF Core.",
                address = "55 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng",
                price = 6000000,
                area = 45,
                bedrooms = 2,
                imageUrl = "",
                status = "Available",
                ownerId = ownerAuth.User.Id
            });
            var house = await houseRes.Content.ReadFromJsonAsync<HouseResponseDto>(JsonOptions);
            Assert.NotNull(house);
            Assert.NotEqual(default, house!.CreatedAt);
            Assert.NotNull(house.UpdatedAt);

            // Create Booking + Contract, then Admin soft-deletes Contract
            var startDate = DateTime.UtcNow.AddDays(5);
            var endDate = startDate.AddMonths(6);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tenantAuth.Token);
            var bkRes = await client.PostAsJsonAsync("/api/bookings", new
            {
                userId = tenantAuth.User.Id,
                houseId = house.Id,
                startDate,
                endDate
            });
            var bk = await bkRes.Content.ReadFromJsonAsync<BookingResponseDto>(JsonOptions);

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            var ctRes = await client.PostAsJsonAsync("/api/contracts", new
            {
                bookingId = bk!.Id,
                monthlyRent = 6000000,
                deposit = 6000000,
                startDate,
                endDate,
                status = "Pending"
            });
            var ct = await ctRes.Content.ReadFromJsonAsync<ContractResponseDto>(JsonOptions);
            Assert.NotNull(ct);
            Assert.NotEqual(default, ct!.CreatedAt);

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminAuth!.Token);
            var delCtRes = await client.DeleteAsync($"/api/contracts/{ct.Id}");
            Assert.Equal(HttpStatusCode.NoContent, delCtRes.StatusCode);

            var getCtAfterDel = await client.GetAsync($"/api/contracts/{ct.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getCtAfterDel.StatusCode);

            // Soft-delete House
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);
            var delHouseRes = await client.DeleteAsync($"/api/houses/{house.Id}");
            Assert.Equal(HttpStatusCode.OK, delHouseRes.StatusCode);

            var getHouseAfterDel = await client.GetAsync($"/api/houses/{house.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getHouseAfterDel.StatusCode);

            // Verify both records STILL exist in DB with IsDeleted = true & DeletedAt != null
            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var rawHouse = await db.Houses.IgnoreQueryFilters().FirstOrDefaultAsync(h => h.Id == house.Id);
            var rawContract = await db.Contracts.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == ct.Id);
            Assert.NotNull(rawHouse);
            Assert.True(rawHouse!.IsDeleted);
            Assert.NotNull(rawHouse.DeletedAt);
            Assert.NotNull(rawContract);
            Assert.True(rawContract!.IsDeleted);
            Assert.NotNull(rawContract.DeletedAt);
        }

        [Fact]
        public async Task HouseUpdateAndDelete_CleansUpOldLocalImageFile()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient();

            var ownerAuth = await RegisterAsync(client, "owner_img_clean", "Owner", "1990-01-01");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.Token);

            // Upload image 1
            var img1 = await UploadValidPngAsync(client, "img1.png");
            var img2 = await UploadValidPngAsync(client, "img2.png");

            var env = factory.Services.GetRequiredService<IWebHostEnvironment>();
            var img1Path = Path.Combine(env.WebRootPath, "images", img1.SavedFileName);
            var img2Path = Path.Combine(env.WebRootPath, "images", img2.SavedFileName);
            Assert.True(File.Exists(img1Path));
            Assert.True(File.Exists(img2Path));

            // Create House using image 1
            var houseRes = await client.PostAsJsonAsync("/api/houses", new
            {
                title = "Nhà test xóa ảnh cũ tự động Đà Nẵng",
                description = "Kiểm tra tự động dọn ảnh cục bộ cũ khi cập nhật hoặc xóa nhà.",
                address = "12 Lê Duẩn, Quận Hải Châu, TP. Đà Nẵng",
                price = 5500000,
                area = 36,
                bedrooms = 1,
                imageUrl = $"http://localhost:5066{img1.Url}",
                status = "Available",
                ownerId = ownerAuth.User.Id
            });
            var house = await houseRes.Content.ReadFromJsonAsync<HouseResponseDto>(JsonOptions);
            Assert.NotNull(house);

            // Update House to image 2 -> image 1 should be deleted automatically!
            var updateRes = await client.PutAsJsonAsync($"/api/houses/{house!.Id}", new
            {
                title = "Nhà test xóa ảnh cũ tự động Đà Nẵng (Updated)",
                description = "Kiểm tra tự động dọn ảnh cục bộ cũ khi cập nhật hoặc xóa nhà.",
                address = "12 Lê Duẩn, Quận Hải Châu, TP. Đà Nẵng",
                price = 5600000,
                area = 36,
                bedrooms = 1,
                imageUrl = $"http://localhost:5066{img2.Url}",
                status = "Available",
                ownerId = ownerAuth.User.Id
            });
            Assert.Equal(HttpStatusCode.OK, updateRes.StatusCode);
            Assert.False(File.Exists(img1Path));
            Assert.True(File.Exists(img2Path));

            // Delete House -> image 2 should also be deleted automatically!
            var deleteRes = await client.DeleteAsync($"/api/houses/{house.Id}");
            Assert.Equal(HttpStatusCode.OK, deleteRes.StatusCode);
            Assert.False(File.Exists(img2Path));
        }

        private static async Task<(string SavedFileName, string Url)> UploadValidPngAsync(HttpClient client, string fileName)
        {
            using var form = new MultipartFormDataContent();
            byte[] pngBytes = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D };
            var content = new ByteArrayContent(pngBytes);
            content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            form.Add(content, "file", fileName);

            var res = await client.PostAsync("/api/files/upload-image", form);
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var json = await res.Content.ReadFromJsonAsync<JsonElement>();
            return (json.GetProperty("savedFileName").GetString()!, json.GetProperty("url").GetString()!);
        }

        private static async Task<AuthResponseDto> RegisterAsync(
            HttpClient client,
            string username,
            string role,
            string dob)
        {
            var res = await client.PostAsJsonAsync("/api/auth/register", new
            {
                username,
                fullName = username,
                email = $"{username}@test.com",
                password = "Password123",
                phone = "0912345678",
                role,
                dateOfBirth = dob
            });
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var auth = await res.Content.ReadFromJsonAsync<AuthResponseDto>(JsonOptions);
            Assert.NotNull(auth);
            return auth!;
        }
    }
}
