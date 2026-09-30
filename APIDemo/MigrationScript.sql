IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Username] nvarchar(50) NOT NULL,
    [FullName] nvarchar(100) NOT NULL,
    [Email] nvarchar(100) NOT NULL,
    [Password] nvarchar(100) NOT NULL,
    [Phone] nvarchar(15) NOT NULL,
    [Role] nvarchar(20) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [Houses] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(150) NOT NULL,
    [Description] nvarchar(1000) NOT NULL,
    [Address] nvarchar(250) NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [Area] float NOT NULL,
    [Bedrooms] int NOT NULL,
    [ImageUrl] nvarchar(500) NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [OwnerId] int NOT NULL,
    CONSTRAINT [PK_Houses] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Houses_Users_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Bookings] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [HouseId] int NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    CONSTRAINT [PK_Bookings] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Bookings_Houses_HouseId] FOREIGN KEY ([HouseId]) REFERENCES [Houses] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Bookings_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Contracts] (
    [Id] int NOT NULL IDENTITY,
    [BookingId] int NOT NULL,
    [MonthlyRent] decimal(18,2) NOT NULL,
    [Deposit] decimal(18,2) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    CONSTRAINT [PK_Contracts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Contracts_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_Bookings_HouseId] ON [Bookings] ([HouseId]);

CREATE INDEX [IX_Bookings_UserId] ON [Bookings] ([UserId]);

CREATE UNIQUE INDEX [IX_Contracts_BookingId] ON [Contracts] ([BookingId]);

CREATE INDEX [IX_Houses_OwnerId] ON [Houses] ([OwnerId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260930043549_InitialCreate', N'10.0.12');

COMMIT;
GO

