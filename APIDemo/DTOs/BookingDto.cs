using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class BookingDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "UserId không hợp lệ.")]
        public int UserId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "HouseId không hợp lệ.")]
        public int HouseId { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu không được để trống.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc không được để trống.")]
        public DateTime EndDate { get; set; }

        [MaxLength(20, ErrorMessage = "Trạng thái tối đa 20 ký tự.")]
        public string? Status { get; set; }
    }
}
