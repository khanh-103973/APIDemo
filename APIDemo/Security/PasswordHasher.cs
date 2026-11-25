using System.Security.Cryptography;
using System.Text;

namespace APIDemo.Security
{
    /// <summary>
    /// Chuẩn băm mật khẩu PBKDF2-HMAC-SHA512 (100.000 vòng lặp, salt ngẫu nhiên 256-bit)
    /// kèm tương thích ngược và tự động nâng cấp cho các tài khoản seed HMACSHA512 cũ.
    /// </summary>
    public static class PasswordHasher
    {
        private const int SaltSize = 32;
        private const int HashSize = 64;
        private const int Iterations = 100_000;
        private static readonly byte[] VersionPrefix = "PBK2"u8.ToArray(); // 4 bytes

        public static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            var rawSalt = RandomNumberGenerator.GetBytes(SaltSize);
            passwordHash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                rawSalt,
                Iterations,
                HashAlgorithmName.SHA512,
                HashSize);

            passwordSalt = new byte[VersionPrefix.Length + SaltSize];
            Buffer.BlockCopy(VersionPrefix, 0, passwordSalt, 0, VersionPrefix.Length);
            Buffer.BlockCopy(rawSalt, 0, passwordSalt, VersionPrefix.Length, SaltSize);
        }

        public static bool VerifyPassword(
            string password,
            byte[]? storedHash,
            byte[]? storedSalt,
            out bool needsRehash)
        {
            needsRehash = false;

            if (string.IsNullOrEmpty(password) || storedHash == null || storedSalt == null ||
                storedHash.Length == 0 || storedSalt.Length == 0)
            {
                return false;
            }

            if (IsPbkdf2Salt(storedSalt))
            {
                var rawSalt = storedSalt.AsSpan(VersionPrefix.Length, SaltSize);
                var computed = Rfc2898DeriveBytes.Pbkdf2(
                    Encoding.UTF8.GetBytes(password),
                    rawSalt,
                    Iterations,
                    HashAlgorithmName.SHA512,
                    HashSize);

                return CryptographicOperations.FixedTimeEquals(computed, storedHash);
            }

            // Tương thích ngược với tài khoản seed HMACSHA512 cũ trong SQL Server
            using var hmac = new HMACSHA512(storedSalt);
            var legacyHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            var isValid = CryptographicOperations.FixedTimeEquals(legacyHash, storedHash);
            if (isValid)
            {
                needsRehash = true;
            }
            return isValid;
        }

        private static bool IsPbkdf2Salt(byte[] salt)
        {
            return salt.Length == VersionPrefix.Length + SaltSize &&
                   salt.AsSpan(0, VersionPrefix.Length).SequenceEqual(VersionPrefix);
        }
    }
}
