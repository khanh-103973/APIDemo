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

        public BookingService(IBookingRepository bookingRepo, IHouseRepository houseRepo)
        {
            _bookingRepo = bookingRepo;
            _houseRepo = houseRepo;
        }

        public async Task<IEnumerable<Booking>> GetAllBookingsAsync(
            string? status,
            int currentUserId,
            bool isAdmin,
            bool isOwnerOrManager)
        {
            if (isAdmin)
            {
                return await _bookingRepo.GetAllAsync(status);
            }

            return await _bookingRepo.GetAllForUserAsync(status, currentUserId, includeOwnedHouses: isOwnerOrManager);
        }

        public async Task<Booking?> GetBookingByIdAsync(int id, int currentUserId, bool isAdmin)
        {
            var booking = await _bookingRepo.GetByIdWithHouseAsync(id);
            if (booking is null) return null;

            var isTenant = booking.UserId == currentUserId;
            var isHouseOwner = booking.House != null && booking.House.OwnerId == currentUserId;
            if (!isAdmin && !isTenant && !isHouseOwner)
            {
                throw new ForbiddenException("Bạn không có quyền xem lịch đặt phòng của người khác.");
            }

            return booking;
        }

        public async Task<(bool IsSuccess, string Message, Booking? Data)> CreateBookingAsync(
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

            return (true, "Tạo lịch đặt phòng thành công.", booking);
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

                booking.Status = requestedStatus;
            }
            else if (string.IsNullOrWhiteSpace(booking.Status))
            {
                booking.Status = "Pending";
            }

            _bookingRepo.Update(booking);
            await _bookingRepo.SaveChangesAsync();

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
    }
}
