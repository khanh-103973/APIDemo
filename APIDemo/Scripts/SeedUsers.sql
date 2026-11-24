-- Du lieu mau de test search/filter/pagination. Mat khau: 123456
-- Them 500 user MOI; Id duoc SQL Server tu sinh.
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @i BIGINT = (SELECT ISNULL(MAX(CAST([Id] AS BIGINT)), 0) + 1 FROM [dbo].[Users]);
DECLARE @Inserted INT = 0;
DECLARE @NumberToAdd INT = 500;
DECLARE @Username NVARCHAR(50);
DECLARE @Email NVARCHAR(100);
DECLARE @Role NVARCHAR(20);
-- HMACSHA512 voi UTF-8, tuong thich AuthService.
DECLARE @PasswordHash VARBINARY(MAX) = 0xA4D0E263C5216C55DA17B575AD76F7FC7FE454C2C9E245F4FD32C91DF79E3A0EEDA1B8BED9509E80C3D76D05C565A90D6A4865B6E10CF3CF99647F176FEF4F01;
DECLARE @PasswordSalt VARBINARY(MAX) = 0xFA37CD1A52840BFCEC5B7E540A420BC4879E3346440DCD55F30271D79B09760D03CCC1B11C8916D426B24E140925D6D81786C78BD2A004CAF78610E0B29B080FA1A5F61A4C5FDAA7E09BD4AC1E58B3CE9295A35777609ACC1A387900E1EB8A9426ED3993A4C27F67A5257B6BDF1F5A3C3CAF1CF28D4B3FE160FB67C762032B9B;

BEGIN TRY
    BEGIN TRANSACTION;

    WHILE @Inserted < @NumberToAdd
    BEGIN
        SET @Username = CONCAT('user', @i);
        SET @Email = CONCAT('user', @i, '@example.com');
        SET @Role = CASE
            WHEN @i % 15 = 0 THEN 'Admin'
            WHEN @i % 5 = 0 THEN 'Manager'
            ELSE 'Tenant'
        END;

        IF NOT EXISTS (
            SELECT 1 FROM [dbo].[Users]
            WHERE [Username] = @Username OR [Email] = @Email
        )
        BEGIN
            INSERT INTO [dbo].[Users]
                ([Username], [FullName], [Email], [Password], [Phone],
                 [PasswordHash], [PasswordSalt], [Role], [Department], [CreatedAt])
            VALUES
                (@Username, CONCAT(N'Nguoi dung ', @i), @Email, N'', N'',
                 @PasswordHash, @PasswordSalt, @Role, N'General',
                 DATEADD(DAY, -CAST(@i % 365 AS INT), GETUTCDATE()));

            SET @Inserted = @Inserted + 1;
        END;

        SET @i = @i + 1;
    END;

    COMMIT TRANSACTION;
    SELECT @Inserted AS InsertedCount;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
