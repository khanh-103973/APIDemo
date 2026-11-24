using APIDemo.DTOs;
using APIDemo.Models;

namespace APIDemo.Services
{
    public interface IBookingService
    {
        Task<IEnumerable<Booking>> GetAllBookingsAsync(string? status);
        Task<Booking?> GetBookingByIdAsync(int id);
        Task<(bool IsSuccess, string Message, Booking? Data)> CreateBookingAsync(BookingDto dto);
        Task<(bool IsSuccess, bool IsNotFound, string Message)> UpdateBookingAsync(int id, BookingDto dto);
        Task<(bool IsSuccess, string Message)> DeleteBookingAsync(int id);
    }
}
