namespace APIDemo.Services
{
    /// <summary>
    /// Abstraction tầng lưu trữ ảnh giúp dễ dàng chuyển đổi từ Local Disk sang Object Storage (S3 / Cloudflare R2 / Azure Blob / MinIO) + CDN khi scale ngang.
    /// </summary>
    public interface IImageStorageService
    {
        Task<(string SavedFileName, string PublicUrl)> SaveImageAsync(
            IFormFile file,
            string extension,
            CancellationToken cancellationToken = default);

        Task DeleteImageAsync(string? imageUrl, CancellationToken cancellationToken = default);
    }

    public class LocalDiskImageStorageService : IImageStorageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<LocalDiskImageStorageService> _logger;

        public LocalDiskImageStorageService(
            IWebHostEnvironment environment,
            ILogger<LocalDiskImageStorageService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<(string SavedFileName, string PublicUrl)> SaveImageAsync(
            IFormFile file,
            string extension,
            CancellationToken cancellationToken = default)
        {
            var imagesFolder = GetImagesFolder();
            if (!Directory.Exists(imagesFolder))
            {
                Directory.CreateDirectory(imagesFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension.ToLowerInvariant()}";
            var filePath = Path.Combine(imagesFolder, uniqueFileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream, cancellationToken);

            return (uniqueFileName, $"/images/{uniqueFileName}");
        }

        public Task DeleteImageAsync(string? imageUrl, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                return Task.CompletedTask;
            }

            // Chỉ xóa file ảnh cục bộ nằm trong /images/ (bỏ qua ảnh ngoài như Unsplash/CDN ngoài)
            var fileName = ExtractManagedImageFileName(imageUrl);
            if (string.IsNullOrWhiteSpace(fileName))
            {
                return Task.CompletedTask;
            }

            try
            {
                var imagesFolder = Path.GetFullPath(GetImagesFolder());
                var safeFileName = Path.GetFileName(fileName);
                var candidatePath = Path.GetFullPath(Path.Combine(imagesFolder, safeFileName));

                // Chống Path Traversal: bắt buộc đường dẫn nằm trong wwwroot/images
                if (!candidatePath.StartsWith(imagesFolder + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
                {
                    return Task.CompletedTask;
                }

                if (File.Exists(candidatePath))
                {
                    File.Delete(candidatePath);
                    _logger.LogInformation("Đã xóa file ảnh cũ không còn sử dụng: {FileName}", safeFileName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không thể xóa file ảnh cũ: {ImageUrl}", imageUrl);
            }

            return Task.CompletedTask;
        }

        private string GetImagesFolder()
        {
            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            return Path.Combine(webRoot, "images");
        }

        private static string? ExtractManagedImageFileName(string imageUrl)
        {
            var trimmed = imageUrl.Trim();
            string pathPart;

            if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
            {
                if (!uri.IsLoopback && !uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
                {
                    return null;
                }
                pathPart = uri.AbsolutePath;
            }
            else
            {
                pathPart = trimmed;
            }

            const string prefix = "/images/";
            if (!pathPart.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var remainder = pathPart[prefix.Length..];
            if (string.IsNullOrWhiteSpace(remainder) || remainder.Contains('/') || remainder.Contains('\\'))
            {
                return null;
            }

            return remainder;
        }
    }
}
