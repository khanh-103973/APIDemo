using System.Reflection;
using System.Security.Claims;
using System.Text;
using APIDemo.Authorization;
using APIDemo.Data;
using APIDemo.Middleware;
using APIDemo.Models;
using APIDemo.Repositories;
using APIDemo.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Đảm bảo thư mục wwwroot và wwwroot/images tồn tại để phục vụ Static Files
    var webRootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
    if (!Directory.Exists(webRootPath))
    {
        Directory.CreateDirectory(webRootPath);
    }
    var imagesDir = Path.Combine(webRootPath, "images");
    if (!Directory.Exists(imagesDir))
    {
        Directory.CreateDirectory(imagesDir);
    }
    builder.Environment.WebRootPath = webRootPath;

    // 1. Cấu hình Serilog Logging
    builder.Host.UseSerilog((context, services, configuration) =>
    {
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext();
    });

    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    // 2. Cấu hình CORS mở rộng cho Frontend (React: 3000, Vite/Vue: 5173)
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("http://localhost:3000", "https://localhost:3000",
                               "http://localhost:5173", "https://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    // 3. Cấu hình Options Pattern cho FileSettings (Buổi 10)
    builder.Services.Configure<FileSettings>(builder.Configuration.GetSection(FileSettings.SectionName));

    // 4. Đọc JwtSettings và cấu hình Authentication
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["SecretKey"] ?? "Scretkey123456789123456789123456789123456789";

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "https://localhost:7255",
            ValidAudience = jwtSettings["Audience"] ?? "https://localhost:7255",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.Zero
        };
    });

    // 5. Cấu hình Authorization & Policy độ tuổi AtLeast18 (Buổi 9)
    builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("AtLeast18", policy =>
            policy.Requirements.Add(new MinimumAgeRequirement(18)));
    });

    // 6. Cấu hình Swagger nâng cao kèm Bearer Auth & XML Docs (Buổi 13)
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "House Rental Management System API",
            Version = "v1",
            Description = "Hệ thống Quản lý Cho thuê Nhà - ASP.NET Core Web API (.NET 10)"
        });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Nhập JWT token thu được sau khi đăng nhập (ví dụ: login admin/123456)."
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });

        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath);
        }
    });

    // 7. Đăng ký AppDbContext (Database APIDemo)
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString));

    // 8. Đăng ký Dependency Injection (Chuẩn kiến trúc N-Tier Buổi 7 & 14)
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IAuthRepository, AuthRepository>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IHouseRepository, HouseRepository>();
    builder.Services.AddScoped<IHouseService, HouseService>();
    builder.Services.AddScoped<IBookingRepository, BookingRepository>();
    builder.Services.AddScoped<IBookingService, BookingService>();
    builder.Services.AddScoped<IContractRepository, ContractRepository>();
    builder.Services.AddScoped<IContractService, ContractService>();
    builder.Services.AddScoped<IFileRepository, FileRepository>();
    builder.Services.AddScoped<IFileService, FileService>();

    builder.Services.AddControllers();

    var app = builder.Build();

    // 9. Tự động Khởi tạo & Seed dữ liệu mẫu hệ thống thuê nhà (Buổi 15)
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            DbInitializer.Seed(context);
        }
        catch (Exception ex) when (ex is not HostAbortedException)
        {
            Log.Warning(ex, "Không thể kết nối CSDL để SeedData tự động khi khởi động. Hãy đảm bảo đã chạy Database_HouseRental.sql trên SSMS.");
        }
    }

    // 10. Pipeline Middlewares
    app.UseExceptionHandling();
    app.UseRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();

        // Tự động chuyển hướng từ URL gốc "/" sang "/swagger"
        app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
    }

    // Bật Static Files phục vụ ảnh nhà thuê từ wwwroot/images cho Frontend (Buổi 10)
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRootPath),
        RequestPath = ""
    });

    app.UseHttpsRedirection();

    // CORS đặt trước Authentication / Authorization
    app.UseCors("AllowFrontend");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Ứng dụng dừng bất thường khi khởi động.");
}
finally
{
    Log.CloseAndFlush();
}
