using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Security;
using APIDemo.Services;
using Microsoft.AspNetCore.Authorization;
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
        private const int MaxMultipleUploadFiles = 10;

        private readonly IFileService _fileService;
        private readonly IImageStorageService _imageStorage;
        private readonly FileSettings _fileSettings;
        private readonly IWebHostEnvironment _environment;

        public FilesController(
            IFileService fileService,
            IImageStorageService imageStorage,
            IOptions<FileSettings> fileSettings,
            IWebHostEnvironment environment)
        {
            _fileService = fileService;
            _imageStorage = imageStorage;
            _fileSettings = fileSettings.Value;
            _environment = environment;
        }

        /// <summary>
        /// Upload ảnh nhà cho thuê qua IImageStorageService. Kiểm tra đuôi file, kích thước và Magic Bytes (JPEG/PNG).
        /// </summary>
        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin,Owner,Manager")]
        [RequestSizeLimit(4_194_304)] // 4 MB
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(IFormFile? file, CancellationToken cancellationToken)
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

            if (!await ImageFileValidator.HasValidImageMagicBytesAsync(file, extension))
            {
                throw new BadRequestException(
                    "File ảnh không hợp lệ (chữ ký nhị phân Magic Bytes không khớp chuẩn JPEG/PNG).");
            }

            var (savedFileName, publicUrl) = await _imageStorage.SaveImageAsync(file, extension, cancellationToken);

            return Ok(new
            {
                message = "Tải ảnh lên thành công.",
                originalFileName = Path.GetFileName(file.FileName),
                savedFileName,
                url = publicUrl,
                size = file.Length,
                uploadedAt = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Upload nhiều ảnh cùng lúc (tối đa 10 ảnh, tổng tối đa 15MB), kiểm tra Magic Bytes từng ảnh.
        /// </summary>
        [HttpPost("upload-multiple")]
        [Authorize(Roles = "Admin,Owner,Manager")]
        [RequestSizeLimit(15_728_640)] // 15 MB
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMultiple(List<IFormFile>? files, CancellationToken cancellationToken)
        {
            if (files == null || files.Count == 0)
            {
                throw new BadRequestException("Vui lòng chọn ít nhất 1 file ảnh để tải lên.");
            }

            if (files.Count > MaxMultipleUploadFiles)
            {
                throw new BadRequestException($"Chỉ được tải lên tối đa {MaxMultipleUploadFiles} ảnh trong một lần.");
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

                if (!await ImageFileValidator.HasValidImageMagicBytesAsync(file, ext))
                {
                    throw new BadRequestException(
                        $"File '{file.FileName}' không hợp lệ (chữ ký nhị phân không phải JPEG/PNG).");
                }
            }

            var uploadedList = new List<object>();

            foreach (var file in files)
            {
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var (savedFileName, publicUrl) = await _imageStorage.SaveImageAsync(file, ext, cancellationToken);

                uploadedList.Add(new
                {
                    originalFileName = Path.GetFileName(file.FileName),
                    savedFileName,
                    url = publicUrl,
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

        [HttpPost("upload")]
        [RequestSizeLimit(6_291_456)] // 6 MB
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] UploadFileDto dto)
        {
            var result = await _fileService.UploadFileAsync(dto.File, User.GetUserId());
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        [HttpGet("download/{id:int}")]
        public async Task<IActionResult> Download(int id)
        {
            var fileDto = await _fileService.GetFileForDownloadAsync(id, User.GetUserId(), User.IsAdmin());

            if (fileDto == null)
            {
                throw new NotFoundException("Không tìm thấy file yêu cầu.");
            }

            return File(fileDto.Content, fileDto.ContentType, fileDto.FileName);
        }
    }
}
