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
using Microsoft.OpenApi;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) =>
    {
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext();
    });

    // 1. Cấu hình CORS cho phép mọi nguồn (hỗ trợ cả http, https và Frontend)
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    // 2. Cấu hình Controllers
    builder.Services.AddControllers();

    // 3. Cấu hình DbContext (Hỗ trợ UseInMemoryDatabase khi phát triển/test, hoặc SQL Server)
    var useInMemory = builder.Configuration.GetValue<bool>("UseInMemoryDatabase", false);
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        if (useInMemory || string.IsNullOrEmpty(connectionString))
        {
            options.UseInMemoryDatabase("HouseRentalAPIDb");
        }
        else
        {
            options.UseSqlServer(connectionString);
        }
    });

    // 4. Đăng ký Dependency Injection (Repository & Service)
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IAuthRepository, AuthRepository>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IFileRepository, FileRepository>();
    builder.Services.AddScoped<IFileService, FileService>();

    // Cấu hình FileSettings sử dụng Options Pattern
    builder.Services.Configure<FileSettings>(builder.Configuration.GetSection(FileSettings.SectionName));
    if (builder.Configuration["MaxImageSize"] != null && long.TryParse(builder.Configuration["MaxImageSize"], out var maxImgSize))
    {
        builder.Services.PostConfigure<FileSettings>(options => options.MaxImageSize = maxImgSize);
    }

    // 5. Cấu hình Authentication & JWT Bearer
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
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role
        };
    });

    // Đăng ký Custom Authorization Handler
    builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();

    // Cấu hình Authorization & Policies
    builder.Services.AddAuthorization(options =>
    {
        // 3. Triển khai Policy "MustBeHR" để kiểm tra Claim "Department" có giá trị là "HR"
        options.AddPolicy("MustBeHR", policy =>
            policy.RequireClaim("Department", "HR"));

        // 5. Triển khai Policy kiểm tra độ tuổi tối thiểu (MinimumAgeRequirement)
        options.AddPolicy("AtLeast18", policy =>
            policy.Requirements.Add(new MinimumAgeRequirement(18)));
    });

    // 2. Bổ sung đoạn này để hiện nút Authorize trên Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo { Title = "ProjectAPIdemo", Version = "v1" });

        // Định nghĩa khung nhập Token
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Nhập trực tiếp chuỗi Token thu được sau khi Login."
        });

        // Áp dụng khung nhập Token cho toàn bộ API
        options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference("Bearer", doc),
                new List<string>()
            }
        });
    });

    builder.Services.AddOpenApi();

    var app = builder.Build();

    // Tự động khởi tạo & Seed dữ liệu người dùng mẫu chuẩn mã hóa HMACSHA512 vào CSDL
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        DbInitializer.Seed(context);
    }

    app.UseExceptionHandling();
    app.UseRequestLogging();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Bật Static Files để phục vụ ảnh và file từ wwwroot
    app.UseStaticFiles();

    // Bật CORS cho mọi yêu cầu
    app.UseCors("AllowAll");

    // Tắt chuyển hướng HttpsRedirection trên local để hỗ trợ chạy trực tiếp trên cả http://localhost:5066 và https://localhost:7255
    // app.UseHttpsRedirection();

    // 7. Bật Authentication trước Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Ứng dụng dừng bất thường khi khởi động.");
}
finally
{
    Log.CloseAndFlush();
}
