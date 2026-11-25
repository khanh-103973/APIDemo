using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class HouseDto
    {
        [Required(ErrorMessage = "Tiêu đề không được để trống.")]
        [StringLength(150, MinimumLength = 5, ErrorMessage = "Tiêu đề phải từ 5 đến 150 ký tự.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mô tả không được để trống.")]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Mô tả phải từ 10 đến 1000 ký tự.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Địa chỉ không được để trống.")]
        [StringLength(250, MinimumLength = 5, ErrorMessage = "Địa chỉ phải từ 5 đến 250 ký tự.")]
        public string Address { get; set; } = string.Empty;

        [Range(1, 1000000000, ErrorMessage = "Giá thuê phải lớn hơn 0.")]
        public decimal Price { get; set; }

        [Range(5, 1000, ErrorMessage = "Diện tích phải từ 5 đến 1000 m2.")]
        public double Area { get; set; }

        [Range(1, 20, ErrorMessage = "Số phòng ngủ phải từ 1 đến 20.")]
        public int Bedrooms { get; set; }

        [RegularExpression(@"^$|^https?://.+", ErrorMessage = "ImageUrl phải là đường dẫn http hoặc https.")]
        public string ImageUrl { get; set; } = string.Empty;

        public string Status { get; set; } = "Available";

        [Range(1, int.MaxValue, ErrorMessage = "OwnerId không hợp lệ.")]
        public int OwnerId { get; set; }
    }
}
