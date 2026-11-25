using APIDemo.Data;
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
        private readonly IHouseRepository _houseRepo;
        private readonly AppDbContext _dbContext;

        public ContractService(
            IContractRepository contractRepo,
            IBookingRepository bookingRepo,
            IHouseRepository houseRepo,
            AppDbContext dbContext)
        {
            _contractRepo = contractRepo;
            _bookingRepo = bookingRepo;
            _houseRepo = houseRepo;
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<ContractResponseDto>> GetAllContractsAsync(
            string? status,
            int currentUserId,
            bool isAdmin,
            bool isOwnerOrManager)
        {
            var contracts = isAdmin
                ? await _contractRepo.GetAllAsync(status)
                : await _contractRepo.GetAllForUserAsync(status, currentUserId, includeOwnedHouses: isOwnerOrManager);

            return contracts.Select(MapToResponseDto).ToList();
        }

        public async Task<ContractResponseDto?> GetContractByIdAsync(int id, int currentUserId, bool isAdmin)
        {
            var contract = await _contractRepo.GetByIdWithDetailsAsync(id);
            if (contract is null) return null;

            EnsureCanReadContract(contract, currentUserId, isAdmin);
            return MapToResponseDto(contract);
        }

        public async Task<ContractResponseDto?> GetContractByBookingIdAsync(int bookingId, int currentUserId, bool isAdmin)
        {
            var contract = await _contractRepo.GetByBookingIdWithDetailsAsync(bookingId);
            if (contract is null) return null;

            EnsureCanReadContract(contract, currentUserId, isAdmin);
            return MapToResponseDto(contract);
        }

        public async Task<(bool IsSuccess, string Message, ContractResponseDto? Data)> CreateContractAsync(
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

            var targetStatus = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status.Trim();
            if (booking.House != null &&
                targetStatus.Equals("Active", StringComparison.OrdinalIgnoreCase) &&
                booking.House.Status.Equals("Rented", StringComparison.OrdinalIgnoreCase))
            {
                throw new ConflictException("Căn nhà này đã ở trạng thái Đã cho thuê, không thể kích hoạt thêm hợp đồng.");
            }

            var contract = new Contract
            {
                BookingId = dto.BookingId,
                MonthlyRent = dto.MonthlyRent,
                Deposit = dto.Deposit,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = targetStatus
            };

            await TransactionHelper.ExecuteInTransactionAsync(_dbContext, async () =>
            {
                await _contractRepo.AddAsync(contract);

                if (booking.House != null && targetStatus.Equals("Active", StringComparison.OrdinalIgnoreCase))
                {
                    booking.House.Status = "Rented";
                    _houseRepo.Update(booking.House);
                }

                await _dbContext.SaveChangesAsync();
            });

            contract.Booking = booking;
            return (true, "Tạo hợp đồng thành công.", MapToResponseDto(contract));
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

            var previousStatus = contract.Status;
            contract.MonthlyRent = dto.MonthlyRent;
            contract.Deposit = dto.Deposit;
            contract.StartDate = dto.StartDate;
            contract.EndDate = dto.EndDate;
            contract.Status = string.IsNullOrWhiteSpace(dto.Status) ? contract.Status : dto.Status.Trim();

            if (contract.Booking?.House != null &&
                !previousStatus.Equals("Active", StringComparison.OrdinalIgnoreCase) &&
                contract.Status.Equals("Active", StringComparison.OrdinalIgnoreCase) &&
                contract.Booking.House.Status.Equals("Rented", StringComparison.OrdinalIgnoreCase))
            {
                throw new ConflictException("Căn nhà này hiện đã được cho thuê bởi hợp đồng khác.");
            }

            await TransactionHelper.ExecuteInTransactionAsync(_dbContext, async () =>
            {
                _contractRepo.Update(contract);

                if (contract.Booking?.House != null)
                {
                    if (contract.Status.Equals("Terminated", StringComparison.OrdinalIgnoreCase) ||
                        contract.Status.Equals("Expired", StringComparison.OrdinalIgnoreCase) ||
                        contract.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
                    {
                        contract.Booking.House.Status = "Available";
                        _houseRepo.Update(contract.Booking.House);
                    }
                    else if (contract.Status.Equals("Active", StringComparison.OrdinalIgnoreCase))
                    {
                        contract.Booking.House.Status = "Rented";
                        _houseRepo.Update(contract.Booking.House);
                    }
                }

                await _dbContext.SaveChangesAsync();
            });

            return (true, false, $"Cập nhật thành công hợp đồng thuê nhà Id = {id}");
        }

        public async Task<(bool IsSuccess, bool IsNotFound, string Message)> SignContractAsync(
            int id,
            int currentUserId,
            bool isAdmin)
        {
            var contract = await _contractRepo.GetByIdWithDetailsAsync(id);
            if (contract is null)
            {
                return (false, true, $"Không tìm thấy hợp đồng thuê nhà Id = {id}");
            }

            var isTenant = contract.Booking != null && contract.Booking.UserId == currentUserId;
            if (!isAdmin && !isTenant)
            {
                throw new ForbiddenException("Chỉ khách thuê của hợp đồng này mới có quyền xác nhận ký.");
            }

            if (!contract.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
            {
                return (false, false, $"Hợp đồng đang ở trạng thái '{contract.Status}', chỉ hợp đồng 'Pending' mới có thể ký xác nhận.");
            }

            if (contract.Booking?.House != null &&
                contract.Booking.House.Status.Equals("Rented", StringComparison.OrdinalIgnoreCase))
            {
                throw new ConflictException("Căn nhà này đã được người khác ký hợp đồng thuê trước đó.");
            }

            await TransactionHelper.ExecuteInTransactionAsync(_dbContext, async () =>
            {
                contract.Status = "Active";
                _contractRepo.Update(contract);

                if (contract.Booking?.House != null)
                {
                    contract.Booking.House.Status = "Rented";
                    _houseRepo.Update(contract.Booking.House);
                }

                await _dbContext.SaveChangesAsync();
            });

            return (true, false, "Khách thuê đã xác nhận ký hợp đồng thành công.");
        }

        public async Task<(bool IsSuccess, bool IsNotFound, string Message)> RejectContractAsync(
            int id,
            int currentUserId,
            bool isAdmin)
        {
            var contract = await _contractRepo.GetByIdWithDetailsAsync(id);
            if (contract is null)
            {
                return (false, true, $"Không tìm thấy hợp đồng thuê nhà Id = {id}");
            }

            var isTenant = contract.Booking != null && contract.Booking.UserId == currentUserId;
            if (!isAdmin && !isTenant)
            {
                throw new ForbiddenException("Chỉ khách thuê của hợp đồng này mới có quyền từ chối hợp đồng.");
            }

            if (!contract.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
            {
                return (false, false, $"Chỉ có thể từ chối hợp đồng đang chờ ký (trạng thái hiện tại: '{contract.Status}').");
            }

            await TransactionHelper.ExecuteInTransactionAsync(_dbContext, async () =>
            {
                contract.Status = "Terminated";
                _contractRepo.Update(contract);

                if (contract.Booking?.House != null)
                {
                    contract.Booking.House.Status = "Available";
                    _houseRepo.Update(contract.Booking.House);
                }

                await _dbContext.SaveChangesAsync();
            });

            return (true, false, "Khách thuê đã từ chối hợp đồng. Phòng đã được mở lại trạng thái còn trống.");
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

        private static ContractResponseDto MapToResponseDto(Contract contract) => new()
        {
            Id = contract.Id,
            BookingId = contract.BookingId,
            MonthlyRent = contract.MonthlyRent,
            Deposit = contract.Deposit,
            StartDate = contract.StartDate,
            EndDate = contract.EndDate,
            Status = contract.Status,
            HouseId = contract.Booking?.HouseId,
            HouseTitle = contract.Booking?.House?.Title,
            TenantId = contract.Booking?.UserId,
            TenantName = contract.Booking?.User?.FullName,
            CreatedAt = contract.CreatedAt,
            UpdatedAt = contract.UpdatedAt
        };
    }
}
