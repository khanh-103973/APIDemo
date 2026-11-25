using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace APIDemo.Tests
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _environmentName;
        private readonly string _dbName;

        public CustomWebApplicationFactory(string environmentName = "Development")
        {
            _environmentName = environmentName;
            _dbName = $"HouseRentalTestDb_{Guid.NewGuid():N}";
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment(_environmentName);
            builder.UseSetting("UseInMemoryDatabase", "true");
            builder.UseSetting("InMemoryDatabaseName", _dbName);
            builder.UseSetting("AutoSeedDatabase", "true");
            builder.UseSetting("AllowedHosts", "*");
            builder.UseSetting("JwtSettings:SecretKey", "UnitTest_SuperSecretKey_AtLeast32CharsLong_2026!");
            builder.UseSetting("JwtSettings:Issuer", "https://localhost:7255");
            builder.UseSetting("JwtSettings:Audience", "https://localhost:7255");
            builder.UseSetting("JwtSettings:ExpiryMinutes", "15");
            builder.UseSetting("JwtSettings:RefreshTokenExpiryDays", "7");

            builder.ConfigureAppConfiguration((_, configBuilder) =>
            {
                configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["UseInMemoryDatabase"] = "true",
                    ["InMemoryDatabaseName"] = _dbName,
                    ["AutoSeedDatabase"] = "true",
                    ["AllowedHosts"] = "*",
                    ["JwtSettings:SecretKey"] = "UnitTest_SuperSecretKey_AtLeast32CharsLong_2026!",
                    ["JwtSettings:Issuer"] = "https://localhost:7255",
                    ["JwtSettings:Audience"] = "https://localhost:7255",
                    ["JwtSettings:ExpiryMinutes"] = "15",
                    ["JwtSettings:RefreshTokenExpiryDays"] = "7"
                });
            });
        }
    }
}
