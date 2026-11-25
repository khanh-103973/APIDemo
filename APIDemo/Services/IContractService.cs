using APIDemo.DTOs;

namespace APIDemo.Services
{
    public interface IContractService
    {
        Task<IEnumerable<ContractResponseDto>> GetAllContractsAsync(string? status, int currentUserId, bool isAdmin, bool isOwnerOrManager);
        Task<ContractResponseDto?> GetContractByIdAsync(int id, int currentUserId, bool isAdmin);
        Task<ContractResponseDto?> GetContractByBookingIdAsync(int bookingId, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, string Message, ContractResponseDto? Data)> CreateContractAsync(ContractDto dto, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateContractAsync(int id, ContractDto dto, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, bool IsNotFound, string Message)> SignContractAsync(int id, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, bool IsNotFound, string Message)> RejectContractAsync(int id, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, string Message)> DeleteContractAsync(int id);
    }
}
