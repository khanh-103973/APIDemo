using APIDemo.DTOs;
using APIDemo.Exceptions;
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

        public async Task<IEnumerable<Contract>> GetAllContractsAsync(
            string? status,
            int currentUserId,
            bool isAdmin,
            bool isOwnerOrManager)
        {
            if (isAdmin)
            {
                return await _contractRepo.GetAllAsync(status);
            }

            return await _contractRepo.GetAllForUserAsync(status, currentUserId, includeOwnedHouses: isOwnerOrManager);
        }

        public async Task<Contract?> GetContractByIdAsync(int id, int currentUserId, bool isAdmin)
        {
            var contract = await _contractRepo.GetByIdWithDetailsAsync(id);
            if (contract is null) return null;

            EnsureCanReadContract(contract, currentUserId, isAdmin);
            return contract;
        }

        public async Task<Contract?> GetContractByBookingIdAsync(int bookingId, int currentUserId, bool isAdmin)
        {
            var contract = await _contractRepo.GetByBookingIdWithDetailsAsync(bookingId);
            if (contract is null) return null;

            EnsureCanReadContract(contract, currentUserId, isAdmin);
            return contract;
        }

        public async Task<(bool IsSuccess, string Message, Contract? Data)> CreateContractAsync(
            ContractDto dto,
            int currentUserId,
            bool isAdmin)
        {
            if (dto is null || dto.StartDate >= dto.EndDate)
            {
                return (false, "Dữ liệu không hợp lệ hoặc ngày bắt đầu phải nhỏ hơn ngày kết thúc.", null);
            }

            if (dto.MonthlyRent <= 0)
            {
                return (false, "Giá thuê hàng tháng phải lớn hơn 0.", null);
            }

            var booking = await _bookingRepo.GetByIdWithHouseAsync(dto.BookingId);
            if (booking == null)
            {
                return (false, $"Không tìm thấy lịch đặt phòng có BookingId = {dto.BookingId}", null);
            }

            // Chặn IDOR: chỉ Admin hoặc chính Chủ nhà của căn nhà trong Booking mới được lập hợp đồng
            var isHouseOwner = booking.House != null && booking.House.OwnerId == currentUserId;
            if (!isAdmin && !isHouseOwner)
            {
                throw new ForbiddenException("Bạn chỉ có quyền tạo hợp đồng cho nhà cho thuê thuộc sở hữu của mình.");
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
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status.Trim()
            };

            await _contractRepo.AddAsync(contract);
            await _contractRepo.SaveChangesAsync();

            return (true, "Tạo hợp đồng thành công.", contract);
        }

        public async Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateContractAsync(
            int id,
            ContractDto dto,
            int currentUserId,
            bool isAdmin)
        {
            if (dto is null || dto.StartDate >= dto.EndDate)
            {
                return (false, false, "Dữ liệu không hợp lệ hoặc ngày bắt đầu phải nhỏ hơn ngày kết thúc.");
            }

            if (dto.MonthlyRent <= 0)
            {
                return (false, false, "Giá thuê hàng tháng phải lớn hơn 0.");
            }

            var contract = await _contractRepo.GetByIdWithDetailsAsync(id);
            if (contract is null)
            {
                return (false, true, $"Không tìm thấy hợp đồng thuê nhà Id = {id}");
            }

            var isHouseOwner = contract.Booking?.House != null && contract.Booking.House.OwnerId == currentUserId;
            if (!isAdmin && !isHouseOwner)
            {
                throw new ForbiddenException("Bạn chỉ có quyền cập nhật hợp đồng thuộc nhà cho thuê của mình.");
            }

            contract.MonthlyRent = dto.MonthlyRent;
            contract.Deposit = dto.Deposit;
            contract.StartDate = dto.StartDate;
            contract.EndDate = dto.EndDate;
            contract.Status = string.IsNullOrWhiteSpace(dto.Status) ? contract.Status : dto.Status.Trim();

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

        private static void EnsureCanReadContract(Contract contract, int currentUserId, bool isAdmin)
        {
            if (isAdmin) return;

            var isTenant = contract.Booking != null && contract.Booking.UserId == currentUserId;
            var isHouseOwner = contract.Booking?.House != null && contract.Booking.House.OwnerId == currentUserId;
            if (!isTenant && !isHouseOwner)
            {
                throw new ForbiddenException("Bạn không có quyền truy cập hợp đồng thuê nhà của người khác.");
            }
        }
    }
}
