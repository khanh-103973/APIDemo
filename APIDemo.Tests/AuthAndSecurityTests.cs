using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using APIDemo.DTOs;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace APIDemo.Tests
{
    public class AuthAndSecurityTests
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        [Fact]
        public async Task HealthEndpoint_ReturnsHealthy_AndSecurityHeaders()
        {
            await using var factory = new CustomWebApplicationFactory("Production");
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });

            var res = await client.GetAsync("/health");
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);

            var body = await res.Content.ReadAsStringAsync();
            Assert.Contains("Healthy", body);
            Assert.True(res.Headers.Contains("X-Content-Type-Options"));
            Assert.True(res.Headers.Contains("X-Frame-Options"));
            Assert.True(res.Headers.Contains("Content-Security-Policy"));
        }

        [Fact]
        public async Task Production_BlocksDevelopmentOnlyControllers()
        {
            await using var factory = new CustomWebApplicationFactory("Production");
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });

            var errRes = await client.GetAsync("/api/errors/bad-request");
            var empRes = await client.GetAsync("/api/employees");

            Assert.Equal(HttpStatusCode.NotFound, errRes.StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, empRes.StatusCode);
        }

        [Fact]
        public async Task PublicRegister_BlocksAdminRole_AndAllowsTenant()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient();

            var adminAttempt = await client.PostAsJsonAsync("/api/auth/register", new
            {
                username = "hacker_admin",
                fullName = "Hacker",
                email = "hacker@test.com",
                password = "Password123",
                phone = "0912345678",
                role = "Admin",
                dateOfBirth = "1995-01-01"
            });
            Assert.Equal(HttpStatusCode.Forbidden, adminAttempt.StatusCode);

            var tenantAttempt = await client.PostAsJsonAsync("/api/auth/register", new
            {
                username = "valid_tenant",
                fullName = "Valid Tenant",
                email = "valid_tenant@test.com",
                password = "Password123",
                phone = "0912345678",
                role = "Tenant",
                dateOfBirth = "1995-01-01"
            });
            Assert.Equal(HttpStatusCode.Created, tenantAttempt.StatusCode);
            Assert.True(tenantAttempt.Headers.TryGetValues("Set-Cookie", out var cookies));
            var cookieHeader = string.Join(";", cookies);
            Assert.Contains("hr_access_token=", cookieHeader);
            Assert.Contains("hr_refresh_token=", cookieHeader);
            Assert.Contains("httponly", cookieHeader, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task RefreshTokenRotation_DetectsReuse_AndLogoutRevokes()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                HandleCookies = false
            });

            var loginRes = await client.PostAsJsonAsync("/api/auth/login", new
            {
                username = "tenant_an",
                password = "123456"
            });
            Assert.Equal(HttpStatusCode.OK, loginRes.StatusCode);
            var firstRefreshCookie = ExtractCookie(loginRes, "hr_refresh_token");
            Assert.False(string.IsNullOrWhiteSpace(firstRefreshCookie));

            // 1. Rotate refresh token -> succeeds and returns a brand-new refresh cookie
            using var refreshReq1 = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
            refreshReq1.Headers.Add("Cookie", $"hr_refresh_token={firstRefreshCookie}");
            var refreshRes1 = await client.SendAsync(refreshReq1);
            Assert.Equal(HttpStatusCode.OK, refreshRes1.StatusCode);
            var rotatedRefreshCookie = ExtractCookie(refreshRes1, "hr_refresh_token");
            Assert.NotEqual(firstRefreshCookie, rotatedRefreshCookie);

            // 2. Reusing the old revoked refresh token triggers reuse attack detection (401)
            using var reuseReq = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
            reuseReq.Headers.Add("Cookie", $"hr_refresh_token={firstRefreshCookie}");
            var reuseRes = await client.SendAsync(reuseReq);
            Assert.Equal(HttpStatusCode.Unauthorized, reuseRes.StatusCode);

            // 3. Because reuse revoked all user tokens, the rotated token is now also revoked (401)
            using var afterReuseReq = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
            afterReuseReq.Headers.Add("Cookie", $"hr_refresh_token={rotatedRefreshCookie}");
            var afterReuseRes = await client.SendAsync(afterReuseReq);
            Assert.Equal(HttpStatusCode.Unauthorized, afterReuseRes.StatusCode);
        }

        [Fact]
        public async Task Login_RateLimit_Triggers429OnSixthAttempt()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient();

            HttpStatusCode lastStatus = HttpStatusCode.OK;
            for (var i = 0; i < 6; i++)
            {
                var res = await client.PostAsJsonAsync("/api/auth/login", new
                {
                    username = "admin",
                    password = "wrong_password"
                });
                lastStatus = res.StatusCode;
                if (i < 5)
                {
                    Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
                }
            }

            Assert.Equal(HttpStatusCode.TooManyRequests, lastStatus);
        }

        [Fact]
        public async Task AdminSuspendUser_BlocksLogin()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient();

            var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new { username = "admin", password = "123456" });
            var adminAuth = await adminLogin.Content.ReadFromJsonAsync<AuthResponseDto>(JsonOptions);
            Assert.NotNull(adminAuth);

            // Find tenant_an ID via register a fresh user to suspend cleanly
            var regRes = await client.PostAsJsonAsync("/api/auth/register", new
            {
                username = "suspend_target",
                fullName = "Suspend Target",
                email = "suspend_target@test.com",
                password = "Password123",
                phone = "0912345678",
                role = "Tenant",
                dateOfBirth = "1996-05-05"
            });
            var regAuth = await regRes.Content.ReadFromJsonAsync<AuthResponseDto>(JsonOptions);
            Assert.NotNull(regAuth);

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminAuth!.Token);
            var suspendRes = await client.PatchAsJsonAsync($"/api/users/{regAuth!.User.Id}/status", new { isActive = false });
            Assert.Equal(HttpStatusCode.OK, suspendRes.StatusCode);

            client.DefaultRequestHeaders.Authorization = null;
            var blockedLogin = await client.PostAsJsonAsync("/api/auth/login", new
            {
                username = "suspend_target",
                password = "Password123"
            });
            Assert.Equal(HttpStatusCode.Forbidden, blockedLogin.StatusCode);
        }

        [Fact]
        public async Task ChangePassword_VerifiesOldPassword_RevokesRefreshTokens_AndAllowsNewLogin()
        {
            await using var factory = new CustomWebApplicationFactory("Development");
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                HandleCookies = false
            });

            var regRes = await client.PostAsJsonAsync("/api/auth/register", new
            {
                username = "chg_pwd_user",
                fullName = "Change Password User",
                email = "chg_pwd@test.com",
                password = "OldPassword123",
                phone = "0912345678",
                role = "Tenant",
                dateOfBirth = "1995-04-04"
            });
            Assert.Equal(HttpStatusCode.Created, regRes.StatusCode);
            var auth = await regRes.Content.ReadFromJsonAsync<AuthResponseDto>(JsonOptions);
            var initialRefreshCookie = ExtractCookie(regRes, "hr_refresh_token");
            Assert.False(string.IsNullOrWhiteSpace(initialRefreshCookie));

            // 1. Wrong current password -> 400 BadRequest
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.Token);
            var wrongOld = await client.PostAsJsonAsync("/api/auth/change-password", new
            {
                currentPassword = "WrongPassword",
                newPassword = "NewPassword456",
                confirmNewPassword = "NewPassword456"
            });
            Assert.Equal(HttpStatusCode.BadRequest, wrongOld.StatusCode);

            // 2. Valid change password -> 200 OK & revokes existing Refresh Tokens
            var changeOk = await client.PostAsJsonAsync("/api/auth/change-password", new
            {
                currentPassword = "OldPassword123",
                newPassword = "NewPassword456",
                confirmNewPassword = "NewPassword456"
            });
            Assert.Equal(HttpStatusCode.OK, changeOk.StatusCode);

            // 3. Old refresh token is now revoked -> 401 Unauthorized
            client.DefaultRequestHeaders.Authorization = null;
            using var staleRefreshReq = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
            staleRefreshReq.Headers.Add("Cookie", $"hr_refresh_token={initialRefreshCookie}");
            var staleRefreshRes = await client.SendAsync(staleRefreshReq);
            Assert.Equal(HttpStatusCode.Unauthorized, staleRefreshRes.StatusCode);

            // 4. Old password fails (401), new password logs in (200)
            var oldLogin = await client.PostAsJsonAsync("/api/auth/login", new
            {
                username = "chg_pwd_user",
                password = "OldPassword123"
            });
            Assert.Equal(HttpStatusCode.Unauthorized, oldLogin.StatusCode);

            var newLogin = await client.PostAsJsonAsync("/api/auth/login", new
            {
                username = "chg_pwd_user",
                password = "NewPassword456"
            });
            Assert.Equal(HttpStatusCode.OK, newLogin.StatusCode);
        }

        private static string ExtractCookie(HttpResponseMessage response, string cookieName)
        {
            if (!response.Headers.TryGetValues("Set-Cookie", out var headers))
                return string.Empty;

            foreach (var header in headers)
            {
                var parts = header.Split(';')[0].Split('=', 2);
                if (parts.Length == 2 && parts[0].Trim().Equals(cookieName, StringComparison.OrdinalIgnoreCase))
                {
                    return Uri.UnescapeDataString(parts[1].Trim());
                }
            }
            return string.Empty;
        }
    }
}
