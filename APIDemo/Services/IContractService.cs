using APIDemo.DTOs;
using APIDemo.Models;

namespace APIDemo.Services
{
    public interface IContractService
    {
        Task<IEnumerable<Contract>> GetAllContractsAsync(string? status, int currentUserId, bool isAdmin, bool isOwnerOrManager);
        Task<Contract?> GetContractByIdAsync(int id, int currentUserId, bool isAdmin);
        Task<Contract?> GetContractByBookingIdAsync(int bookingId, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, string Message, Contract? Data)> CreateContractAsync(ContractDto dto, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateContractAsync(int id, ContractDto dto, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, string Message)> DeleteContractAsync(int id);
    }
}
