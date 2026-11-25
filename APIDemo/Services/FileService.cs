using System.Security.Cryptography;
using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Repositories;
using APIDemo.Security;
using Microsoft.AspNetCore.Http;
using static APIDemo.DTOs.FileUploadDbDto;

namespace APIDemo.Services
{
    public class FileService : IFileService
    {
        private readonly IFileRepository _fileRepository;

        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".txt", ".xlsx" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

        public FileService(IFileRepository fileRepository)
        {
            _fileRepository = fileRepository;
        }

        public async Task<FileResponseDto> UploadFileAsync(IFormFile file, int ownerId)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File rỗng hoặc không hợp lệ. Vui lòng chọn file.");

            if (file.Length > MaxFileSize)
                throw new ArgumentException("Kích thước file vượt quá giới hạn cho phép (tối đa 5MB).");

            var fileName = Path.GetFileName(file.FileName);
            var extension = Path.GetExtension(fileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(extension) || !_allowedExtensions.Contains(extension))
                throw new ArgumentException($"Định dạng file '{extension}' không được hỗ trợ. Chỉ chấp nhận các định dạng: {string.Join(", ", _allowedExtensions)}.");

            if ((extension == ".jpg" || extension == ".jpeg" || extension == ".png") &&
                !await ImageFileValidator.HasValidImageMagicBytesAsync(file, extension))
            {
                throw new BadRequestException("Nội dung file ảnh không hợp lệ (sai chữ ký nhị phân JPEG/PNG).");
            }

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var contentBytes = memoryStream.ToArray();

            var fileHash = Convert.ToHexString(SHA256.HashData(contentBytes));

            var duplicateByHash = await _fileRepository.GetByHashAsync(fileHash);
            if (duplicateByHash != null)
            {
                throw new InvalidOperationException($"File này đã tồn tại trên hệ thống (trùng nội dung 100% với file '{duplicateByHash.FileName}', Id: {duplicateByHash.Id}). Không thể tải lên lại lần 2!");
            }

            var existingByName = await _fileRepository.GetByFileNameAsync(fileName);
            if (existingByName != null)
            {
                if (existingByName.OwnerId.HasValue && existingByName.OwnerId.Value != ownerId)
                {
                    throw new ForbiddenException("Bạn không có quyền ghi đè file của người dùng khác.");
                }

                existingByName.Content = contentBytes;
                existingByName.ContentType = file.ContentType;
                existingByName.Length = file.Length;
                existingByName.FileHash = fileHash;
                existingByName.OwnerId = ownerId;
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

            var newFile = new StoredFile
            {
                FileName = fileName,
                ContentType = file.ContentType,
                Content = contentBytes,
                Length = file.Length,
                FileHash = fileHash,
                OwnerId = ownerId,
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

        public async Task<FileDownloadDto?> GetFileForDownloadAsync(int id, int currentUserId, bool isAdmin)
        {
            var file = await _fileRepository.GetByIdAsync(id);
            if (file == null) return null;

            // Chặn IDOR trên StoredFiles: chỉ Admin hoặc chính chủ sở hữu file mới được tải xuống
            if (!isAdmin && file.OwnerId != currentUserId)
            {
                throw new ForbiddenException("Bạn không có quyền tải xuống tài liệu thuộc sở hữu của người dùng khác.");
            }

            return new FileDownloadDto
            {
                Content = file.Content,
                ContentType = file.ContentType,
                FileName = file.FileName
            };
        }
    }
}
