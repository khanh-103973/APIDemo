using APIDemo.Data;
using APIDemo.DTOs;
using APIDemo.Exceptions;
using APIDemo.Models;
using APIDemo.Repositories;

namespace APIDemo.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly IHouseRepository _houseRepo;
        private readonly IContractRepository _contractRepo;
        private readonly AppDbContext _dbContext;

        public BookingService(
            IBookingRepository bookingRepo,
            IHouseRepository houseRepo,
            IContractRepository contractRepo,
            AppDbContext dbContext)
        {
            _bookingRepo = bookingRepo;
            _houseRepo = houseRepo;
            _contractRepo = contractRepo;
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync(
            string? status,
            int currentUserId,
            bool isAdmin,
            bool isOwnerOrManager)
        {
            var bookings = isAdmin
                ? await _bookingRepo.GetAllAsync(status)
                : await _bookingRepo.GetAllForUserAsync(status, currentUserId, includeOwnedHouses: isOwnerOrManager);

            return bookings.Select(MapToResponseDto).ToList();
        }

        public async Task<BookingResponseDto?> GetBookingByIdAsync(int id, int currentUserId, bool isAdmin)
        {
            var booking = await _bookingRepo.GetByIdWithHouseAsync(id);
            if (booking is null) return null;

            var isTenant = booking.UserId == currentUserId;
            var isHouseOwner = booking.House != null && booking.House.OwnerId == currentUserId;
            if (!isAdmin && !isTenant && !isHouseOwner)
            {
                throw new ForbiddenException("Bạn không có quyền xem lịch đặt phòng của người khác.");
            }

            return MapToResponseDto(booking);
        }

        public async Task<(bool IsSuccess, string Message, BookingResponseDto? Data)> CreateBookingAsync(
            BookingDto dto,
            int currentUserId,
            bool isAdmin)
        {
            if (dto is null || dto.StartDate >= dto.EndDate)
            {
                return (false, "Dữ liệu không hợp lệ hoặc ngày bắt đầu phải nhỏ hơn ngày kết thúc.", null);
            }

            // Chặn IDOR: người dùng thường không được đặt lịch hộ/giả mạo UserId của người khác
            if (!isAdmin && dto.UserId != currentUserId)
            {
                throw new ForbiddenException("Bạn chỉ có thể đặt lịch thuê nhà cho chính tài khoản của mình.");
            }

            var house = await _houseRepo.GetByIdAsync(dto.HouseId);
            if (house is null)
            {
                throw new NotFoundException($"Không tìm thấy nhà cho thuê Id = {dto.HouseId}");
            }

            // Chặn double-booking lên nhà đã cho thuê hoặc đang bị trùng khoảng thời gian đã duyệt
            if (house.Status.Equals("Rented", StringComparison.OrdinalIgnoreCase))
            {
                throw new ConflictException("Căn nhà này hiện đã được cho thuê, không thể đặt lịch mới.");
            }

            if (await _bookingRepo.HasOverlappingApprovedBookingAsync(dto.HouseId, dto.StartDate, dto.EndDate))
            {
                throw new ConflictException("Căn nhà đã có lịch thuê được duyệt trong khoảng thời gian này.");
            }

            var booking = new Booking
            {
                UserId = isAdmin ? dto.UserId : currentUserId,
                HouseId = dto.HouseId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Pending"
            };

            await _bookingRepo.AddAsync(booking);
            await _bookingRepo.SaveChangesAsync();

            booking.House = house;
            return (true, "Tạo lịch đặt phòng thành công.", MapToResponseDto(booking));
        }

        public async Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateBookingAsync(
            int id,
            BookingDto dto,
            int currentUserId,
            bool isAdmin)
        {
            if (dto is null || dto.StartDate >= dto.EndDate)
            {
                return (false, false, "Dữ liệu không hợp lệ hoặc ngày bắt đầu phải nhỏ hơn ngày kết thúc.");
            }

            var booking = await _bookingRepo.GetByIdWithHouseAsync(id);
            if (booking is null)
            {
                return (false, true, $"Không tìm thấy lịch thuê nhà Id = {id}");
            }

            var isTenant = booking.UserId == currentUserId;
            var isHouseOwner = booking.House != null && booking.House.OwnerId == currentUserId;
            if (!isAdmin && !isTenant && !isHouseOwner)
            {
                throw new ForbiddenException("Bạn không có quyền cập nhật lịch đặt phòng này.");
            }

            if (isAdmin)
            {
                booking.UserId = dto.UserId;
                booking.HouseId = dto.HouseId;
            }

            booking.StartDate = dto.StartDate;
            booking.EndDate = dto.EndDate;

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                var requestedStatus = dto.Status.Trim();
                // Khách thuê không được tự duyệt (Approved/Completed) lịch đặt của chính mình
                if (!isAdmin && !isHouseOwner &&
                    !requestedStatus.Equals("Cancelled", StringComparison.OrdinalIgnoreCase) &&
                    !requestedStatus.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                {
                    throw new ForbiddenException("Chỉ Chủ nhà hoặc Quản trị viên mới có quyền duyệt/hoàn thành lịch đặt phòng.");
                }

                // Chặn duyệt chồng chéo trên cùng căn nhà
                if ((requestedStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase) ||
                     requestedStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase)) &&
                    await _bookingRepo.HasOverlappingApprovedBookingAsync(booking.HouseId, booking.StartDate, booking.EndDate, booking.Id))
                {
                    throw new ConflictException("Căn nhà đã có lịch thuê khác được duyệt trùng khoảng thời gian này.");
                }

                booking.Status = requestedStatus;
            }
            else if (string.IsNullOrWhiteSpace(booking.Status))
            {
                booking.Status = "Pending";
            }

            // Bọc trong Transaction nguyên tử: cập nhật Booking + tự sinh Contract (Pending) nếu Completed
            await TransactionHelper.ExecuteInTransactionAsync(_dbContext, async () =>
            {
                _bookingRepo.Update(booking);

                if ((isAdmin || isHouseOwner) &&
                    booking.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                {
                    var existingContract = await _contractRepo.GetByBookingIdAsync(booking.Id);
                    if (existingContract is null)
                    {
                        var rentPrice = booking.House != null && booking.House.Price > 0
                            ? booking.House.Price
                            : 4500000m;
                        var autoContract = new Contract
                        {
                            BookingId = booking.Id,
                            MonthlyRent = rentPrice,
                            Deposit = rentPrice,
                            StartDate = booking.StartDate,
                            EndDate = booking.EndDate > booking.StartDate
                                ? booking.EndDate
                                : booking.StartDate.AddMonths(6),
                            Status = "Pending"
                        };
                        await _contractRepo.AddAsync(autoContract);
                    }
                }

                await _dbContext.SaveChangesAsync();
            });

            return (true, false, $"Cập nhật thành công lịch thuê nhà Id = {id}");
        }

        public async Task<(bool IsSuccess, string Message)> DeleteBookingAsync(int id, int currentUserId, bool isAdmin)
        {
            var booking = await _bookingRepo.GetByIdWithHouseAsync(id);
            if (booking is null)
            {
                return (false, $"Không tìm thấy lịch thuê nhà Id = {id}");
            }

            var isTenant = booking.UserId == currentUserId;
            var isHouseOwner = booking.House != null && booking.House.OwnerId == currentUserId;
            if (!isAdmin && !isTenant && !isHouseOwner)
            {
                throw new ForbiddenException("Bạn không có quyền xóa lịch đặt phòng của người khác.");
            }

            _bookingRepo.Delete(booking);
            await _bookingRepo.SaveChangesAsync();

            return (true, $"Đã xóa thành công lịch thuê nhà Id = {id}");
        }

        private static BookingResponseDto MapToResponseDto(Booking booking) => new()
        {
            Id = booking.Id,
            UserId = booking.UserId,
            HouseId = booking.HouseId,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            Status = booking.Status,
            HouseTitle = booking.House?.Title,
            TenantName = booking.User?.FullName,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt
        };
    }
}
