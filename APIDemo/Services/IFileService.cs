using Microsoft.AspNetCore.Http;
using static APIDemo.DTOs.FileUploadDbDto;

namespace APIDemo.Services
{
    public interface IFileService
    {
        Task<FileResponseDto> UploadFileAsync(IFormFile file, int ownerId);
        Task<FileDownloadDto?> GetFileForDownloadAsync(int id, int currentUserId, bool isAdmin);
    }
}
