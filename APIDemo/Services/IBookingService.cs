using APIDemo.DTOs;

namespace APIDemo.Services
{
    public interface IBookingService
    {
        Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync(string? status, int currentUserId, bool isAdmin, bool isOwnerOrManager);
        Task<BookingResponseDto?> GetBookingByIdAsync(int id, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, string Message, BookingResponseDto? Data)> CreateBookingAsync(BookingDto dto, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateBookingAsync(int id, BookingDto dto, int currentUserId, bool isAdmin);
        Task<(bool IsSuccess, string Message)> DeleteBookingAsync(int id, int currentUserId, bool isAdmin);
    }
}
