using System.Security.Cryptography;
using System.Text;
using APIDemo.Security;
using Xunit;

namespace APIDemo.Tests
{
    public class PasswordHasherTests
    {
        [Fact]
        public void CreateAndVerify_Pbkdf2Password_SucceedsWithoutRehash()
        {
            PasswordHasher.CreatePasswordHash("StrongPass@123", out var hash, out var salt);

            Assert.True(PasswordHasher.VerifyPassword("StrongPass@123", hash, salt, out var needsRehash));
            Assert.False(needsRehash);
            Assert.False(PasswordHasher.VerifyPassword("WrongPass@123", hash, salt, out _));
        }

        [Fact]
        public void VerifyLegacyHmacSha512_SucceedsAndFlagsRehash()
        {
            using var hmac = new HMACSHA512();
            var legacySalt = hmac.Key;
            var legacyHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("123456"));

            Assert.True(PasswordHasher.VerifyPassword("123456", legacyHash, legacySalt, out var needsRehash));
            Assert.True(needsRehash);
            Assert.False(PasswordHasher.VerifyPassword("wrong", legacyHash, legacySalt, out _));
        }
    }
}
