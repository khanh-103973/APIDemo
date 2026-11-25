using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;
using APIDemo.Authorization;
using APIDemo.Controllers;
using APIDemo.Data;
using APIDemo.DTOs.Common;
using APIDemo.Filters;
using APIDemo.HealthChecks;
using APIDemo.Middleware;
using APIDemo.Models;
using APIDemo.Repositories;
using APIDemo.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Nạp file cấu hình local không commit (appsettings.local.json) nếu tồn tại ở máy dev
    builder.Configuration.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

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

    // 1.1 Cấu hình ForwardedHeaders để đọc đúng IP khách hàng khi chạy sau Nginx / Cloudflare / Load Balancer
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.ForwardLimit = 2;
    });

    // 2. Cấu hình CORS theo danh sách Origin được phép (hỗ trợ HttpOnly Cookie qua AllowCredentials)
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? new[]
        {
            "http://localhost:3000",
            "https://localhost:3000",
            "http://localhost:5173",
            "https://localhost:5173"
        };

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });

    // 3. Cấu hình Options Pattern cho FileSettings
    builder.Services.Configure<FileSettings>(builder.Configuration.GetSection(FileSettings.SectionName));

    // 4. Đọc JwtSettings từ Configuration (User Secrets / Environment Variables / appsettings.local.json — không lưu secret trong Git)
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer();

    builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
        .Configure<IConfiguration, IHostEnvironment>((options, configuration, env) =>
        {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 32)
            {
                throw new InvalidOperationException(
                    "Thiếu cấu hình JwtSettings:SecretKey (tối thiểu 32 ký tự). Hãy cấu hình qua User Secrets, Environment Variables hoặc appsettings.local.json.");
            }

            var jwtIssuer = jwtSettings["Issuer"] ?? "https://localhost:7255";
            var jwtAudience = jwtSettings["Audience"] ?? "https://localhost:7255";

            options.RequireHttpsMetadata = !env.IsDevelopment();
            options.SaveToken = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                RoleClaimType = ClaimTypes.Role,
                ClockSkew = TimeSpan.Zero
            };

            // Chỉ fallback đọc Access Token từ HttpOnly Cookie (hr_access_token) khi request KHÔNG có Authorization header
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (string.IsNullOrEmpty(context.Token) &&
                        !context.Request.Headers.ContainsKey("Authorization") &&
                        context.Request.Cookies.TryGetValue(AuthController.AccessTokenCookieName, out var cookieToken) &&
                        !string.IsNullOrWhiteSpace(cookieToken))
                    {
                        context.Token = cookieToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

    // 5. Cấu hình Authorization & Policies
    builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("MustBeHR", policy =>
            policy.RequireClaim("Department", "HR"));

        options.AddPolicy("AtLeast18", policy =>
            policy.Requirements.Add(new MinimumAgeRequirement(18)));
    });

    // 6. Cấu hình Swagger kèm Bearer JWT Auth & XML Docs (chỉ bật ở Development)
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
            Description = "Nhập JWT token thu được sau khi đăng nhập."
        });

        options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference("Bearer", doc),
                new List<string>()
            }
        });

        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath);
        }
    });

    builder.Services.AddOpenApi();

    // 7. Đăng ký AppDbContext (SQL Server hoặc UseInMemoryDatabase khi chạy test)
    var useInMemory = builder.Configuration.GetValue<bool>("UseInMemoryDatabase", false);
    var inMemoryDbName = builder.Configuration["InMemoryDatabaseName"] ?? "HouseRentalAPIDb";
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        if (useInMemory || string.IsNullOrWhiteSpace(connectionString))
        {
            options.UseInMemoryDatabase(inMemoryDbName);
        }
        else
        {
            options.UseSqlServer(connectionString);
        }
    });

    // 8. Đăng ký Dependency Injection (N-Tier + Storage Abstraction)
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
    builder.Services.AddScoped<IImageStorageService, LocalDiskImageStorageService>();

    builder.Services.AddControllers(options =>
    {
        options.Conventions.Add(new DevelopmentOnlyControllerConvention(builder.Environment));
    });

    // 8.1 Health Checks (/health kiểm tra trạng thái ứng dụng và kết nối Database)
    builder.Services.AddHealthChecks()
        .AddCheck<DatabaseHealthCheck>("database");

    // 8.2 Rate Limiting chống brute-force cho endpoint đăng nhập (5 lần / phút / IP)
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        options.AddPolicy("AuthLoginPolicy", httpContext =>
        {
            var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: clientIp,
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0,
                    AutoReplenishment = true
                });
        });

        options.OnRejected = async (context, cancellationToken) =>
        {
            context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.HttpContext.Response.ContentType = "application/json; charset=utf-8";
            if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            {
                context.HttpContext.Response.Headers.RetryAfter =
                    Math.Ceiling(retryAfter.TotalSeconds).ToString();
            }
            else
            {
                context.HttpContext.Response.Headers.RetryAfter = "60";
            }

            var error = new ErrorResponse
            {
                StatusCode = StatusCodes.Status429TooManyRequests,
                Message = "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.",
                TraceId = context.HttpContext.TraceIdentifier,
                Timestamp = DateTime.UtcNow
            };

            await context.HttpContext.Response.WriteAsync(
                JsonSerializer.Serialize(error, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }),
                cancellationToken);
        };
    });

    var app = builder.Build();

    // 9. Chỉ auto-seed ở môi trường Development (hoặc khi cấu hình AutoSeedDatabase=true cho Docker/integration test),
    // tránh race condition khi triển khai nhiều instance ở Production
    var shouldAutoSeed = app.Environment.IsDevelopment() ||
                         app.Configuration.GetValue<bool>("AutoSeedDatabase", false);
    if (shouldAutoSeed)
    {
        using var scope = app.Services.CreateScope();
        try
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Database.EnsureCreated();
            DbInitializer.Seed(context);
        }
        catch (Exception ex) when (ex is not HostAbortedException)
        {
            Log.Warning(ex, "Không thể kết nối CSDL để khởi tạo/SeedData tự động khi khởi động.");
        }
    }

    // 10. Pipeline Middlewares
    app.UseForwardedHeaders();
    app.UseSecurityHeaders();
    app.UseExceptionHandling();
    app.UseRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI();

        app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
    }
    else
    {
        app.UseHsts();
        if (!app.Configuration.GetValue<bool>("DisableHttpsRedirection", false))
        {
            app.UseHttpsRedirection();
        }
    }

    // Bật Static Files phục vụ ảnh nhà thuê từ wwwroot/images
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRootPath),
        RequestPath = ""
    });

    // CORS đặt trước RateLimiter và Authentication / Authorization
    app.UseCors("AllowFrontend");
    app.UseRateLimiter();

    app.UseAuthentication();
    app.UseAuthorization();

    // Health Check endpoint công khai
    app.MapHealthChecks("/health", new HealthCheckOptions
    {
        ResponseWriter = async (context, report) =>
        {
            context.Response.ContentType = "application/json; charset=utf-8";
            var payload = new
            {
                status = report.Status.ToString(),
                timestamp = DateTime.UtcNow,
                checks = report.Entries.Select(entry => new
                {
                    name = entry.Key,
                    status = entry.Value.Status.ToString(),
                    description = entry.Value.Description,
                    durationMs = Math.Round(entry.Value.Duration.TotalMilliseconds, 2)
                })
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
        }
    });

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

public partial class Program { }
