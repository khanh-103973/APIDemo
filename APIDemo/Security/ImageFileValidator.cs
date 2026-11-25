namespace APIDemo.Security
{
    /// <summary>
    /// Kiểm tra chữ ký nhị phân thực tế (Magic Bytes) của file ảnh để chống giả mạo đuôi file (.exe/.php đổi thành .jpg).
    /// </summary>
    public static class ImageFileValidator
    {
        private static readonly byte[] JpegSignature = { 0xFF, 0xD8, 0xFF };
        private static readonly byte[] PngSignature = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };

        public static async Task<bool> HasValidImageMagicBytesAsync(IFormFile file, string extension)
        {
            if (file == null || file.Length < 8)
            {
                return false;
            }

            var header = new byte[8];
            await using var stream = file.OpenReadStream();
            var bytesRead = await stream.ReadAsync(header.AsMemory(0, header.Length));
            if (bytesRead < 3)
            {
                return false;
            }

            return extension.ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => bytesRead >= JpegSignature.Length &&
                                     header.AsSpan(0, JpegSignature.Length).SequenceEqual(JpegSignature),
                ".png" => bytesRead >= PngSignature.Length &&
                          header.AsSpan(0, PngSignature.Length).SequenceEqual(PngSignature),
                _ => false
            };
        }
    }
}
