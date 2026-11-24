using APIDemo.DTOs;
using APIDemo.Models;
using APIDemo.Repositories;

namespace APIDemo.Services
{
    public class ContractService : IContractService
    {
        private readonly IContractRepository _contractRepo;
        private readonly IBookingRepository _bookingRepo;

        public ContractService(IContractRepository contractRepo, IBookingRepository bookingRepo)
        {
            _contractRepo = contractRepo;
            _bookingRepo = bookingRepo;
        }

        public async Task<IEnumerable<Contract>> GetAllContractsAsync(string? status)
        {
            return await _contractRepo.GetAllAsync(status);
        }

        public async Task<Contract?> GetContractByIdAsync(int id)
        {
            return await _contractRepo.GetByIdAsync(id);
        }

        public async Task<Contract?> GetContractByBookingIdAsync(int bookingId)
        {
            return await _contractRepo.GetByBookingIdAsync(bookingId);
        }

        public async Task<(bool IsSuccess, string Message, Contract? Data)> CreateContractAsync(ContractDto dto)
        {
            if (dto is null || dto.StartDate >= dto.EndDate)
            {
                return (false, "Dữ liệu không hợp lệ hoặc ngày bắt đầu phải nhỏ hơn ngày kết thúc.", null);
            }

            if (dto.MonthlyRent <= 0)
            {
                return (false, "Giá thuê hàng tháng phải lớn hơn 0.", null);
            }

            var booking = await _bookingRepo.GetByIdAsync(dto.BookingId);
            if (booking == null)
            {
                return (false, $"Không tìm thấy lịch đặt phòng có BookingId = {dto.BookingId}", null);
            }

            var existingContract = await _contractRepo.GetByBookingIdAsync(dto.BookingId);
            if (existingContract != null)
            {
                return (false, $"Lịch đặt phòng Id = {dto.BookingId} đã có hợp đồng thuê nhà (ContractId = {existingContract.Id}).", null);
            }

            var contract = new Contract
            {
                BookingId = dto.BookingId,
                MonthlyRent = dto.MonthlyRent,
                Deposit = dto.Deposit,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status
            };

            await _contractRepo.AddAsync(contract);
            await _contractRepo.SaveChangesAsync();

            return (true, "Tạo hợp đồng thành công.", contract);
        }

        public async Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateContractAsync(int id, ContractDto dto)
        {
            if (dto is null || dto.StartDate >= dto.EndDate)
            {
                return (false, false, "Dữ liệu không hợp lệ hoặc ngày bắt đầu phải nhỏ hơn ngày kết thúc.");
            }

            if (dto.MonthlyRent <= 0)
            {
                return (false, false, "Giá thuê hàng tháng phải lớn hơn 0.");
            }

            var contract = await _contractRepo.GetByIdAsync(id);
            if (contract is null)
            {
                return (false, true, $"Không tìm thấy hợp đồng thuê nhà Id = {id}");
            }

            contract.MonthlyRent = dto.MonthlyRent;
            contract.Deposit = dto.Deposit;
            contract.StartDate = dto.StartDate;
            contract.EndDate = dto.EndDate;
            contract.Status = string.IsNullOrWhiteSpace(dto.Status) ? contract.Status : dto.Status;

            _contractRepo.Update(contract);
            await _contractRepo.SaveChangesAsync();

            return (true, false, $"Cập nhật thành công hợp đồng thuê nhà Id = {id}");
        }

        public async Task<(bool IsSuccess, string Message)> DeleteContractAsync(int id)
        {
            var contract = await _contractRepo.GetByIdAsync(id);
            if (contract is null)
            {
                return (false, $"Không tìm thấy hợp đồng thuê nhà Id = {id}");
            }

            _contractRepo.Delete(contract);
            await _contractRepo.SaveChangesAsync();

            return (true, $"Đã xóa thành công hợp đồng thuê nhà Id = {id}");
        }
    }
}
