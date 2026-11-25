using APIDemo.DTOs;
using APIDemo.Models;

namespace APIDemo.Services
{
    public interface IContractService
    {
        Task<IEnumerable<Contract>> GetAllContractsAsync(string? status);
        Task<Contract?> GetContractByIdAsync(int id);
        Task<Contract?> GetContractByBookingIdAsync(int bookingId);
        Task<(bool IsSuccess, string Message, Contract? Data)> CreateContractAsync(ContractDto dto);
        Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateContractAsync(int id, ContractDto dto);
        Task<(bool IsSuccess, string Message)> DeleteContractAsync(int id);
    }
}
