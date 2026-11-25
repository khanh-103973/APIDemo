using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class ContractDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "BookingId không hợp lệ.")]
        public int BookingId { get; set; }

        [Range(1, 1000000000, ErrorMessage = "Giá thuê hàng tháng phải lớn hơn 0.")]
        public decimal MonthlyRent { get; set; }

        [Range(0, 1000000000, ErrorMessage = "Tiền đặt cọc không được âm.")]
        public decimal Deposit { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu không được để trống.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc không được để trống.")]
        public DateTime EndDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";
    }
}
