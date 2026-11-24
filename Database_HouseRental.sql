-- ========================================================
-- DỰ ÁN: HỆ THỐNG QUẢN LÝ CHO THUÊ NHÀ (HOUSE RENTAL SYSTEM)
-- MÔN HỌC: LẬP TRÌNH .NET (ASP.NET CORE WEB API)
-- HỆ QUẢN TRỊ CSDL: MICROSOFT SQL SERVER
-- TÊN DATABASE ĐỒNG BỘ: APIDemo
-- HƯỚNG DẪN: MỞ BẰNG SSMS VÀ BẤM F5 (EXECUTE) ĐỂ CHẠY 1-CLICK
-- ========================================================

-- 1. TẠO CƠ SỞ DỮ LIỆU APIDemo
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'APIDemo')
BEGIN
    CREATE DATABASE APIDemo;
END
GO

USE APIDemo;
GO

-- 2. XÓA BẢNG CŨ NẾU ĐÃ TỒN TẠI (THEO THỨ TỰ RÀNG BUỘC KHÓA NGOẠI)
IF OBJECT_ID('dbo.Contracts', 'U') IS NOT NULL DROP TABLE dbo.Contracts;
IF OBJECT_ID('dbo.Bookings', 'U') IS NOT NULL DROP TABLE dbo.Bookings;
IF OBJECT_ID('dbo.Houses', 'U') IS NOT NULL DROP TABLE dbo.Houses;
IF OBJECT_ID('dbo.StoredFiles', 'U') IS NOT NULL DROP TABLE dbo.StoredFiles;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ========================================================
-- BẢNG 1: USERS (NGƯỜI DÙNG: ADMIN, CHỦ NHÀ, NGƯỜI THUÊ)
-- ========================================================
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(100) NULL,
    PasswordHash VARBINARY(MAX) NULL,
    PasswordSalt VARBINARY(MAX) NULL,
    Phone NVARCHAR(15) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'Tenant'
        CONSTRAINT CK_Users_Role CHECK (Role IN ('Admin', 'Tenant', 'Owner')),
    Department NVARCHAR(50) NULL DEFAULT 'General',
    DateOfBirth DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ========================================================
-- BẢNG 2: HOUSES (NHÀ / PHÒNG TRỌ CHO THUÊ)
-- ========================================================
CREATE TABLE Houses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    Address NVARCHAR(250) NOT NULL,
    Price DECIMAL(18,2) NOT NULL 
        CONSTRAINT CK_Houses_Price CHECK (Price > 0),
    Area FLOAT NOT NULL 
        CONSTRAINT CK_Houses_Area CHECK (Area >= 5 AND Area <= 1000),
    Bedrooms INT NOT NULL 
        CONSTRAINT CK_Houses_Bedrooms CHECK (Bedrooms >= 1 AND Bedrooms <= 20),
    ImageUrl NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Available'
        CONSTRAINT CK_Houses_Status CHECK (Status IN ('Available', 'Rented', 'Maintenance')),
    OwnerId INT NOT NULL,
    
    -- Khóa ngoại trỏ về Chủ nhà (User)
    CONSTRAINT FK_Houses_Users_OwnerId FOREIGN KEY (OwnerId) 
        REFERENCES Users(Id) ON DELETE NO ACTION
);
GO

-- ========================================================
-- BẢNG 3: BOOKINGS (LỊCH ĐẶT / GIỮ CHỖ PHÒNG)
-- ========================================================
CREATE TABLE Bookings (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    HouseId INT NOT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending'
        CONSTRAINT CK_Bookings_Status CHECK (Status IN ('Pending', 'Approved', 'Cancelled', 'Completed')),

    -- Ràng buộc ngày kết thúc phải lớn hơn ngày bắt đầu
    CONSTRAINT CK_Bookings_Dates CHECK (EndDate > StartDate),

    -- Dùng NO ACTION để tránh lỗi multiple cascade paths trong SQL Server
    CONSTRAINT FK_Bookings_Users_UserId FOREIGN KEY (UserId) 
        REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Bookings_Houses_HouseId FOREIGN KEY (HouseId) 
        REFERENCES Houses(Id) ON DELETE NO ACTION
);
GO

-- ========================================================
-- BẢNG 4: CONTRACTS (HỢP ĐỒNG THUÊ NHÀ CHÍNH THỨC)
-- ========================================================
CREATE TABLE Contracts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL UNIQUE,
    MonthlyRent DECIMAL(18,2) NOT NULL 
        CONSTRAINT CK_Contracts_MonthlyRent CHECK (MonthlyRent > 0),
    Deposit DECIMAL(18,2) NOT NULL 
        CONSTRAINT CK_Contracts_Deposit CHECK (Deposit >= 0),
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active'
        CONSTRAINT CK_Contracts_Status CHECK (Status IN ('Active', 'Expired', 'Terminated')),

    CONSTRAINT CK_Contracts_Dates CHECK (EndDate > StartDate),

    -- Quan hệ 1-1 với Booking
    CONSTRAINT FK_Contracts_Bookings_BookingId FOREIGN KEY (BookingId) 
        REFERENCES Bookings(Id) ON DELETE CASCADE
);
GO

-- ========================================================
-- BẢNG 5: STOREDFILES (LƯU TRỮ TẬP TIN UPLOAD TRONG CSDL)
-- ========================================================
CREATE TABLE StoredFiles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FileName NVARCHAR(255) NOT NULL,
    ContentType NVARCHAR(100) NOT NULL,
    Content VARBINARY(MAX) NOT NULL,
    Length BIGINT NOT NULL,
    FileHash NVARCHAR(64) NOT NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ========================================================
-- 3. TẠO INDEXES (CHỈ MỤC TỐI ƯU TRUY VẤN)
-- ========================================================
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Houses_OwnerId ON Houses(OwnerId);
CREATE INDEX IX_Houses_Price ON Houses(Price);
CREATE INDEX IX_Houses_Status ON Houses(Status);
CREATE INDEX IX_Bookings_UserId ON Bookings(UserId);
CREATE INDEX IX_Bookings_HouseId ON Bookings(HouseId);
CREATE INDEX IX_Bookings_Status ON Bookings(Status);
CREATE INDEX IX_Contracts_BookingId ON Contracts(BookingId);
CREATE INDEX IX_StoredFiles_FileHash ON StoredFiles(FileHash);
GO

-- ========================================================
-- 4. CHÈN DỮ LIỆU MẪU (SEED DATA ĐẸP, MẬT KHẨU BĂM: 123456)
-- ========================================================

-- Mật khẩu chuẩn băm HMACSHA512 của "123456":
DECLARE @PasswordHash VARBINARY(MAX) = 0xA4D0E263C5216C55DA17B575AD76F7FC7FE454C2C9E245F4FD32C91DF79E3A0EEDA1B8BED9509E80C3D76D05C565A90D6A4865B6E10CF3CF99647F176FEF4F01;
DECLARE @PasswordSalt VARBINARY(MAX) = 0xFA37CD1A52840BFCEC5B7E540A420BC4879E3346440DCD55F30271D79B09760D03CCC1B11C8916D426B24E140925D6D81786C78BD2A004CAF78610E0B29B080FA1A5F61A4C5FDAA7E09BD4AC1E58B3CE9295A35777609ACC1A387900E1EB8A9426ED3993A4C27F67A5257B6BDF1F5A3C3CAF1CF28D4B3FE160FB67C762032B9B;

-- Chèn Users (1 Admin, 2 Chủ nhà, 2 Khách thuê trưởng thành, 1 Khách thuê 14 tuổi để test Policy AtLeast18)
INSERT INTO Users (Username, FullName, Email, Password, PasswordHash, PasswordSalt, Phone, Role, Department, DateOfBirth, CreatedAt) VALUES
('admin', N'Quản Trị Viên', 'admin@rental.com', '123456', @PasswordHash, @PasswordSalt, '0900000001', 'Admin', 'IT', '1990-01-01', GETUTCDATE()),
('owner_nam', N'Nguyễn Văn Nam', 'nam.owner@gmail.com', '123456', @PasswordHash, @PasswordSalt, '0912345678', 'Owner', 'RealEstate', '1985-05-15', GETUTCDATE()),
('owner_hoa', N'Trần Thị Hoa', 'hoa.owner@gmail.com', '123456', @PasswordHash, @PasswordSalt, '0987654321', 'Owner', 'RealEstate', '1988-08-20', GETUTCDATE()),
('tenant_an', N'Lê Văn An', 'an.tenant@gmail.com', '123456', @PasswordHash, @PasswordSalt, '0933112233', 'Tenant', 'General', '2000-02-10', GETUTCDATE()),
('tenant_binh', N'Phạm Thanh Bình', 'binh.tenant@gmail.com', '123456', @PasswordHash, @PasswordSalt, '0944556677', 'Tenant', 'General', '1998-11-25', GETUTCDATE()),
('tenant_tre_em', N'Nguyễn Văn Nhí', 'nhi.underage@gmail.com', '123456', @PasswordHash, @PasswordSalt, '0966778899', 'Tenant', 'General', '2012-06-01', GETUTCDATE());

-- Chèn Houses (Nhà/phòng cho thuê)
INSERT INTO Houses (Title, Description, Address, Price, Area, Bedrooms, ImageUrl, Status, OwnerId) VALUES
(N'Căn hộ mini ban công thoáng mát', N'Đầy đủ nội thất gồm máy lạnh, tủ lạnh, giường nệm. Giờ giấc tự do.', N'Quận 1, TP. Hồ Chí Minh', 4500000, 28, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'Available', 2),
(N'Nhà nguyên căn 2 phòng ngủ tiện nghi', N'Khu dân cư an ninh, yên tĩnh, gần chợ và trường học. Phù hợp gia đình trẻ.', N'Quận Bình Thạnh, TP. Hồ Chí Minh', 9500000, 65, 2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'Rented', 2),
(N'Phòng trọ sinh viên có gác lửng', N'Gần các trường đại học, có camera an ninh, wifi tốc độ cao.', N'Quận Gò Vấp, TP. Hồ Chí Minh', 3200000, 22, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'Available', 3),
(N'Căn hộ cao cấp 3 phòng ngủ view sông', N'Nội thất cao cấp nhập khẩu, hồ bơi, phòng gym miễn phí.', N'Quận 2, TP. Hồ Chí Minh', 18000000, 95, 3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb', 'Available', 3);

-- Chèn Bookings
INSERT INTO Bookings (UserId, HouseId, StartDate, EndDate, Status) VALUES
(4, 1, '2026-12-01', '2027-06-01', 'Pending'),
(5, 2, '2026-10-01', '2027-10-01', 'Approved');

-- Chèn Contracts (Hợp đồng thuê 1-1 với BookingId = 2)
INSERT INTO Contracts (BookingId, MonthlyRent, Deposit, StartDate, EndDate, Status) VALUES
(2, 9500000, 19000000, '2026-10-01', '2027-10-01', 'Active');
GO

-- ========================================================
-- 5. TRUY VẤN KIỂM TRA DỮ LIỆU
-- ========================================================
SELECT * FROM Users;
SELECT * FROM Houses;
SELECT * FROM Bookings;
SELECT * FROM Contracts;
SELECT * FROM StoredFiles;
GO
