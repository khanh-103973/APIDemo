using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;
using APIDemo.Models;
using APIDemo.Repositories;
using static APIDemo.DTOs.FileUploadDbDto;

namespace APIDemo.Services
{
    public class FileService : IFileService
    {
        private readonly IFileRepository _fileRepository;

        // Danh sách đuôi file được phép upload (File Validation)
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".txt", ".xlsx" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

        public FileService(IFileRepository fileRepository)
        {
            _fileRepository = fileRepository;
        }

        public async Task<FileResponseDto> UploadFileAsync(IFormFile file)
        {
            // 1. VALIDATION CƠ BẢN
            if (file == null || file.Length == 0)
                throw new ArgumentException("File rỗng hoặc không hợp lệ. Vui lòng chọn file.");

            if (file.Length > MaxFileSize)
                throw new ArgumentException("Kích thước file vượt quá giới hạn cho phép (tối đa 5MB).");

            var fileName = Path.GetFileName(file.FileName);
            var extension = Path.GetExtension(fileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(extension) || !_allowedExtensions.Contains(extension))
                throw new ArgumentException($"Định dạng file '{extension}' không được hỗ trợ. Chỉ chấp nhận các định dạng: {string.Join(", ", _allowedExtensions)}.");

            // 2. ĐỌC DỮ LIỆU FILE VÀ TÍNH DẤU VÂN TAY (MÃ BĂM SHA-256)
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var contentBytes = memoryStream.ToArray();

            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(contentBytes);
            var fileHash = Convert.ToHexString(hashBytes);

            // 3. KIỂM TRA TRÙNG LẶP NỘI DUNG (FILE CHƯA SỬA MÀ TẢI LÊN LẦN 2)
            var duplicateByHash = await _fileRepository.GetByHashAsync(fileHash);
            if (duplicateByHash != null)
            {
                throw new InvalidOperationException($"File này đã tồn tại trên hệ thống (trùng nội dung 100% với file '{duplicateByHash.FileName}', Id: {duplicateByHash.Id}). Không thể tải lên lại lần 2!");
            }

            // 4. XỬ LÝ TRƯỜNG HỢP: ĐÃ SỬA NỘI DUNG FILE A VÀ ĐẨY LÊN LẠI CÙNG TÊN
            var existingByName = await _fileRepository.GetByFileNameAsync(fileName);
            if (existingByName != null)
            {
                // Vì ở bước 3 Hash không trùng -> nội dung file A ĐÃ ĐƯỢC CHỈNH SỬA
                // Hệ thống sẽ cho phép cập nhật nội dung mới vào file A thay vì chặn oan!
                existingByName.Content = contentBytes;
                existingByName.ContentType = file.ContentType;
                existingByName.Length = file.Length;
                existingByName.FileHash = fileHash;
                existingByName.UploadedAt = DateTime.UtcNow;

                _fileRepository.Update(existingByName);
                await _fileRepository.SaveChangesAsync();

                return new FileResponseDto
                {
                    Id = existingByName.Id,
                    FileName = $"{existingByName.FileName} (Đã cập nhật nội dung mới)",
                    Size = existingByName.Length,
                    UploadedAt = existingByName.UploadedAt
                };
            }

            // 5. TRƯỜNG HỢP FILE HOÀN TOÀN MỚI
            var newFile = new StoredFile
            {
                FileName = fileName,
                ContentType = file.ContentType,
                Content = contentBytes,
                Length = file.Length,
                FileHash = fileHash,
                UploadedAt = DateTime.UtcNow
            };

            var created = await _fileRepository.AddAsync(newFile);

            return new FileResponseDto
            {
                Id = created.Id,
                FileName = created.FileName,
                Size = created.Length,
                UploadedAt = created.UploadedAt
            };
        }

        public async Task<FileDownloadDto?> GetFileForDownloadAsync(int id)
        {
            var file = await _fileRepository.GetByIdAsync(id);
            if (file == null) return null;

            return new FileDownloadDto
            {
                Content = file.Content,
                ContentType = file.ContentType,
                FileName = file.FileName
            };
        }
    }
}
