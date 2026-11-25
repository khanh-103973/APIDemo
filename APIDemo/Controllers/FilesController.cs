using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using static APIDemo.DTOs.FileUploadDbDto;

namespace APIDemo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
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
        // 1. Upload ảnh nhà cho thuê vào wwwroot/images (Phục vụ trực tiếp cho Frontend)
        // ==========================================
        /// <summary>
        /// Upload ảnh nhà cho thuê vào thư mục wwwroot/images. Kiểm tra định dạng (.jpg, .jpeg, .png) và kích thước (Options Pattern).
        /// </summary>
        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin,Owner,Manager")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(IFormFile? file)
        {
            if (file == null || file.Length == 0)
            {
                throw new BadRequestException("Vui lòng chọn file ảnh và kích thước file phải lớn hơn 0.");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_fileSettings.AllowedExtensions.Contains(extension))
            {
                throw new BadRequestException(
                    $"Chỉ cho phép tải lên file ảnh có định dạng: {string.Join(", ", _fileSettings.AllowedExtensions)}.");
            }

            if (file.Length > _fileSettings.MaxImageSize)
            {
                var maxMb = _fileSettings.MaxImageSize / (1024 * 1024);
                throw new BadRequestException(
                    $"Kích thước file vượt quá giới hạn cho phép ({maxMb}MB). Kích thước file của bạn: {file.Length / 1024} KB.");
            }

            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var imagesFolder = Path.Combine(webRoot, "images");
            if (!Directory.Exists(imagesFolder))
            {
                Directory.CreateDirectory(imagesFolder);
            }

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
        // 2. Upload nhiều ảnh cùng lúc cho bộ sưu tập nhà thuê
        // ==========================================
        /// <summary>
        /// Upload nhiều file ảnh cùng lúc cho bộ sưu tập phòng/nhà (List&lt;IFormFile&gt;).
        /// </summary>
        [HttpPost("upload-multiple")]
        [Authorize(Roles = "Admin,Owner,Manager")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMultiple(List<IFormFile>? files)
        {
            if (files == null || files.Count == 0)
            {
                throw new BadRequestException("Vui lòng chọn ít nhất 1 file ảnh để tải lên.");
            }

            foreach (var file in files)
            {
                if (file.Length == 0)
                {
                    throw new BadRequestException($"File '{file.FileName}' có kích thước bằng 0.");
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
                        $"File '{file.FileName}' vượt quá dung lượng tối đa ({maxMb}MB).");
                }
            }

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
                message = $"Đã tải lên thành công {files.Count} file ảnh.",
                totalFiles = files.Count,
                files = uploadedList
            });
        }

        // ==========================================
        // 3. API đọc thông tin môi trường chạy (Buổi 10)
        // ==========================================
        [HttpGet("environment")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetEnvironment()
        {
            return Ok(new
            {
                environmentName = _environment.EnvironmentName,
                isDevelopment = _environment.IsDevelopment(),
                isProduction = _environment.IsProduction(),
                contentRootPath = _environment.ContentRootPath,
                webRootPath = _environment.WebRootPath
            });
        }

        // ==========================================
        // 4. Upload & Download file nhị phân vào Database
        // ==========================================
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] UploadFileDto dto)
        {
            var result = await _fileService.UploadFileAsync(dto.File);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        [HttpGet("download/{id:int}")]
        public async Task<IActionResult> Download(int id)
        {
            var fileDto = await _fileService.GetFileForDownloadAsync(id);

            if (fileDto == null)
            {
                throw new NotFoundException("Không tìm thấy file yêu cầu.");
            }

            return File(fileDto.Content, fileDto.ContentType, fileDto.FileName);
        }
    }
}
