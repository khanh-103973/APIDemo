using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using static APIDemo.DTOs.FileUploadDbDto;

namespace APIDemo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly FileSettings _fileSettings;
        private readonly IWebHostEnvironment _environment;

        public FilesController(
            IFileService fileService,
            IOptions<FileSettings> fileSettings,
            IWebHostEnvironment environment)
        {
            _fileService = fileService;
            _fileSettings = fileSettings.Value;
            _environment = environment;
        }

        // ==========================================
        // 1. BÀI 1: Upload file cơ bản (Bắt buộc chọn file, size > 0)
        // ==========================================
        /// <summary>
        /// Bài 1: Yêu cầu bắt buộc Client phải chọn file và kích thước > 0. Nếu không báo lỗi 400 BadRequest.
        /// </summary>
        [HttpPost("upload-basic")]
        [Consumes("multipart/form-data")]
        public IActionResult UploadBasic(IFormFile? file)
        {
            if (file == null || file.Length == 0)
            {
                throw new BadRequestException("Vui lòng chọn file và kích thước file phải lớn hơn 0.");
            }

            return Ok(new
            {
                message = "File hợp lệ.",
                fileName = file.FileName,
                size = file.Length
            });
        }

        // ==========================================
        // 2 & 3. BÀI 2 & 3: File Validation (.jpg, .png, <= 3MB từ Options Pattern) + Random tên file -> wwwroot/images
        // ==========================================
        /// <summary>
        /// Bài 2 & 3: Chỉ cho phép ảnh (.jpg, .png), tối đa 3MB (dùng Options Pattern từ appsettings.json), random tên file và lưu vào wwwroot/images.
        /// </summary>
        [HttpPost("upload-image")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(IFormFile? file)
        {
            // 1. Bắt buộc chọn file và kích thước > 0
            if (file == null || file.Length == 0)
            {
                throw new BadRequestException("Vui lòng chọn file và kích thước file phải lớn hơn 0.");
            }

            // 2. Validate định dạng (.jpg, .png)
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_fileSettings.AllowedExtensions.Contains(extension))
            {
                throw new BadRequestException(
                    $"Chỉ cho phép tải lên file ảnh có định dạng: {string.Join(", ", _fileSettings.AllowedExtensions)}.");
            }

            // 3. Validate kích thước sử dụng Options Pattern (MaxImageSize từ appsettings.json)
            if (file.Length > _fileSettings.MaxImageSize)
            {
                var maxMb = _fileSettings.MaxImageSize / (1024 * 1024);
                throw new BadRequestException(
                    $"Kích thước file vượt quá giới hạn cho phép ({maxMb}MB). Kích thước file của bạn: {file.Length / 1024} KB.");
            }

            // 4. Tạo thư mục wwwroot/images nếu chưa có
            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var imagesFolder = Path.Combine(webRoot, "images");
            if (!Directory.Exists(imagesFolder))
            {
                Directory.CreateDirectory(imagesFolder);
            }

            // 5. Random tên file để chống ghi đè (sử dụng Guid)
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(imagesFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new
            {
                message = "Tải ảnh lên thành công.",
                originalFileName = file.FileName,
                savedFileName = uniqueFileName,
                url = $"/images/{uniqueFileName}",
                size = file.Length,
                uploadedAt = DateTime.UtcNow
            });
        }

        // ==========================================
        // 4. API đọc cấu hình Environment và trả về tên môi trường đang chạy
        // ==========================================
        /// <summary>
        /// API đọc cấu hình Environment và trả về tên môi trường đang chạy (vd: Development, Production).
        /// </summary>
        [HttpGet("environment")]
        public IActionResult GetEnvironment()
        {
            return Ok(new
            {
                environmentName = _environment.EnvironmentName,
                isDevelopment = _environment.IsDevelopment(),
                isProduction = _environment.IsProduction(),
                isStaging = _environment.IsEnvironment("Staging"),
                contentRootPath = _environment.ContentRootPath,
                webRootPath = _environment.WebRootPath
            });
        }

        // ==========================================
        // 5. Upload nhiều file cùng lúc (List<IFormFile>) kết hợp Options Pattern
        // ==========================================
        /// <summary>
        /// Upload nhiều file cùng lúc (List<IFormFile>) kết hợp Options Pattern cho cấu hình.
        /// </summary>
        [HttpPost("upload-multiple")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMultiple(List<IFormFile>? files)
        {
            if (files == null || files.Count == 0)
            {
                throw new BadRequestException("Vui lòng chọn ít nhất 1 file để tải lên.");
            }

            // 1. Kiểm tra validation toàn bộ các file trước khi tiến hành lưu
            foreach (var file in files)
            {
                if (file.Length == 0)
                {
                    throw new BadRequestException($"File '{file.FileName}' có kích thước bằng 0 (rỗng).");
                }

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_fileSettings.AllowedExtensions.Contains(ext))
                {
                    throw new BadRequestException(
                        $"File '{file.FileName}' không hợp lệ. Chỉ chấp nhận các định dạng: {string.Join(", ", _fileSettings.AllowedExtensions)}.");
                }

                if (file.Length > _fileSettings.MaxImageSize)
                {
                    var maxMb = _fileSettings.MaxImageSize / (1024 * 1024);
                    throw new BadRequestException(
                        $"File '{file.FileName}' vượt quá dung lượng tối đa cho phép ({maxMb}MB).");
                }
            }

            // 2. Lưu các file hợp lệ vào wwwroot/images
            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var imagesFolder = Path.Combine(webRoot, "images");
            if (!Directory.Exists(imagesFolder))
            {
                Directory.CreateDirectory(imagesFolder);
            }

            var uploadedList = new List<object>();

            foreach (var file in files)
            {
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var uniqueFileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(imagesFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                uploadedList.Add(new
                {
                    originalFileName = file.FileName,
                    savedFileName = uniqueFileName,
                    url = $"/images/{uniqueFileName}",
                    size = file.Length
                });
            }

            return Ok(new
            {
                message = $"Đã tải lên thành công {files.Count} file.",
                totalFiles = files.Count,
                files = uploadedList
            });
        }

        // ==========================================
        // UPLOAD & DOWNLOAD FILE TỪ DATABASE (THEO ID)
        // ==========================================
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] UploadFileDto dto)
        {
            var result = await _fileService.UploadFileAsync(dto.File);
            return Ok(result);
        }

        /// <summary>
        /// Tải file từ Database theo Id.
        /// </summary>
        [HttpGet("download/{id:int}")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Download(int id)
        {
            var fileDto = await _fileService.GetFileForDownloadAsync(id)
                ?? throw new NotFoundException("Không tìm thấy file yêu cầu.");

            return File(fileDto.Content, fileDto.ContentType, fileDto.FileName);
        }
    }
}
