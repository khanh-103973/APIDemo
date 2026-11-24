using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class ProductDto
    {
        [Required(ErrorMessage = "Tên sản phẩm không được để trống.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Tên sản phẩm phải từ 2 đến 100 ký tự.")]
        public string Name { get; set; } = string.Empty;

        [Range(0, 1000000000, ErrorMessage = "Giá phải lớn hơn hoặc bằng 0.")]
        public decimal Price { get; set; }

        [Range(0, 100000, ErrorMessage = "Số lượng phải từ 0 đến 100000.")]
        public int Quantity { get; set; }
    }
}
