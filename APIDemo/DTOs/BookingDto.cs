using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class BookingDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "UserId khong hop le.")]
        public int UserId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "HouseId khong hop le.")]
        public int HouseId { get; set; }

        [Required(ErrorMessage = "Ngay bat dau khong duoc de trong.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Ngay ket thuc khong duoc de trong.")]
        public DateTime EndDate { get; set; }
    }
}
