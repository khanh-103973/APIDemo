# House Rental Management System (APIDemo + Frontend)

Hệ thống Quản lý & Cho Thuê Nhà gồm **Backend ASP.NET Core Web API (.NET 10)** theo kiến trúc N-Tier và **Frontend Next.js 16 (React 19 + Tailwind CSS v4)**.

## 1. Cấu trúc thư mục

```text
APIDemo/
├── APIDemo/                         # Backend ASP.NET Core Web API (.NET 10)
│   ├── Authorization/               # Custom Policy (AtLeast18, MustBeHR)
│   ├── Controllers/                 # Auth, Users, Houses, Bookings, Contracts, Files, Errors, Employees
│   ├── Data/                        # AppDbContext (EF Core) & DbInitializer (Seed Data)
│   ├── DTOs/                        # Request/Response DTOs, Pagination, ErrorResponse
│   ├── Exceptions/                  # AppException, BadRequest, NotFound, Unauthorized, Conflict
│   ├── Middleware/                  # ExceptionHandlingMiddleware, RequestLoggingMiddleware
│   ├── Migrations/                  # EF Core Code-First Migration (InitialCleanRentalDb)
│   ├── Models/                      # User, House, Booking, Contract, StoredFile, FileSettings
│   ├── Repositories/                # Repository Pattern (EF Core)
│   ├── Services/                    # Service Pattern (Business Logic)
│   ├── appsettings.json             # Cấu hình Development/Default (Serilog, CORS, JWT, DB)
│   ├── appsettings.Production.json  # Cấu hình mẫu cho Production (không chứa secret)
│   └── Dockerfile                   # Đóng gói Docker container
├── frontend/                        # Frontend Next.js 16 + Tailwind CSS v4
│   ├── src/app/                     # Public, Auth, Tenant (/account), Landlord (/dashboard), Admin (/admin)
│   ├── src/lib/api/client.ts        # HTTP client tự động lưu JWT & gắn Authorization: Bearer <token>
│   └── .env.example                 # Mẫu cấu hình NEXT_PUBLIC_API_URL
├── Database_HouseRental.sql         # Script tạo CSDL SQL Server
├── HouseRental_Postman_Collection.json  # Bộ test Postman (có biến tự động lưu token)
├── BACKEND_AND_FRONTEND_GUIDE.md    # Hướng dẫn kiến trúc & tích hợp FE/BE
└── BAOCAO_DOAN_HUONGDAN_BAOVE.md    # Báo cáo đồ án 5 phần & câu hỏi phản biện
```

## 2. Hướng dẫn chạy nhanh (Local Development)

### A. Chạy Backend (`APIDemo`)
1. Cập nhật chuỗi kết nối SQL Server trong `APIDemo/appsettings.json` (hoặc đặt `"UseInMemoryDatabase": true` nếu muốn chạy thử nhanh không cần SQL Server).
2. Chạy ứng dụng:
   ```powershell
   dotnet run --project APIDemo\APIDemo.csproj
   ```
3. Mở Swagger UI tại: `http://localhost:5066/swagger` (hoặc `https://localhost:7255/swagger`).

### B. Chạy Frontend (`frontend`)
```powershell
cd frontend
npm ci
npm run dev
```
Mở trình duyệt tại `http://localhost:3000`. Frontend sẽ tự kết nối tới Backend tại `http://localhost:5066/api` (có thể tùy chỉnh qua `frontend/.env.local` theo mẫu `frontend/.env.example`).

## 3. Tài khoản thật trong SQL Server (`.\SQLEXPRESS`, mật khẩu chung: `123456`)

| Vai trò | Username | Email | Mật khẩu | Ghi chú |
|---|---|---|---|---|
| **Admin** | `admin` | `admin@rental.com` | `123456` | Toàn quyền quản trị (`Users`, `Houses`, `Contracts`) |
| **Chủ nhà / Quản lý** | `manager` | `manager@rental.com` | `123456` | Tạo/sửa nhà cho thuê, quản lý hợp đồng (`Manager`/`Owner`) |
| **Khách thuê (>= 18 tuổi)** | `adult_user` | `adult@rental.com` | `123456` | Đặt lịch thuê nhà (đạt Policy `AtLeast18`) |
| **Khách thuê (< 18 tuổi)** | `young_user` | `young@rental.com` | `123456` | Dùng để test chặn `403 Forbidden` với Policy `AtLeast18` |
| **Nhân sự (HR)** | `hr_user` | `hr@rental.com` | `123456` | Test Policy `MustBeHR` |

> *(Nếu chạy mới hoàn toàn với database trống / InMemoryDatabase, `DbInitializer` sẽ seed thêm `admin`, `owner_nam`, `owner_hoa`, `tenant_an`, `tenant_binh`, `tenant_tre_em` với mật khẩu `123456`.)*

## 4. Publish & Triển khai (Buổi 13)

```powershell
# Publish Framework-dependent ra thư mục ./publish
dotnet publish APIDemo\APIDemo.csproj -c Release -o .\publish

# Build Docker image (nếu đã cài Docker)
docker build -f APIDemo\Dockerfile -t house-rental-api .
```

> **Lưu ý Production**: Không lưu `ConnectionStrings:DefaultConnection` thật và `JwtSettings:SecretKey` trong `appsettings.Production.json`; hãy truyền qua biến môi trường (`ConnectionStrings__DefaultConnection`, `JwtSettings__SecretKey`) hoặc User Secrets khi phát triển.
