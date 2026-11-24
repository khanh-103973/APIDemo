using APIDemo.DTOs;
using APIDemo.Models;
using APIDemo.Repositories;

namespace APIDemo.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepo;

        public BookingService(IBookingRepository bookingRepo)
        {
            _bookingRepo = bookingRepo;
        }

        public async Task<IEnumerable<Booking>> GetAllBookingsAsync(string? status)
        {
            return await _bookingRepo.GetAllAsync(status);
        }

        public async Task<Booking?> GetBookingByIdAsync(int id)
        {
            return await _bookingRepo.GetByIdAsync(id);
        }

        public async Task<(bool IsSuccess, string Message, Booking? Data)> CreateBookingAsync(BookingDto dto)
        {
            if (dto is null || dto.StartDate >= dto.EndDate)
            {
                return (false, "Dữ liệu không hợp lệ hoặc ngày bắt đầu phải nhỏ hơn ngày kết thúc.", null);
            }

            var booking = new Booking
            {
                UserId = dto.UserId,
                HouseId = dto.HouseId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Pending"
            };

            await _bookingRepo.AddAsync(booking);
            await _bookingRepo.SaveChangesAsync();

            return (true, "Tạo lịch đặt phòng thành công.", booking);
        }

        public async Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateBookingAsync(int id, BookingDto dto)
        {
            if (dto is null || dto.StartDate >= dto.EndDate)
            {
                return (false, false, "Dữ liệu không hợp lệ hoặc ngày bắt đầu phải nhỏ hơn ngày kết thúc.");
            }

            var booking = await _bookingRepo.GetByIdAsync(id);
            if (booking is null)
            {
                return (false, true, $"Không tìm thấy lịch thuê nhà Id = {id}");
            }

            booking.UserId = dto.UserId;
            booking.HouseId = dto.HouseId;
            booking.StartDate = dto.StartDate;
            booking.EndDate = dto.EndDate;
            booking.Status = string.IsNullOrWhiteSpace(booking.Status) ? "Pending" : booking.Status;

            _bookingRepo.Update(booking);
            await _bookingRepo.SaveChangesAsync();

            return (true, false, $"Cập nhật thành công lịch thuê nhà Id = {id}");
        }

        public async Task<(bool IsSuccess, string Message)> DeleteBookingAsync(int id)
        {
            var booking = await _bookingRepo.GetByIdAsync(id);
            if (booking is null)
            {
                return (false, $"Không tìm thấy lịch thuê nhà Id = {id}");
            }

            _bookingRepo.Delete(booking);
            await _bookingRepo.SaveChangesAsync();

            return (true, $"Đã xóa thành công lịch thuê nhà Id = {id}");
        }
    }
}
