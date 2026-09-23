using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class ProductDto
    {
        [Required(ErrorMessage = "Ten san pham khong duoc de trong.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ten san pham phai tu 2 den 100 ky tu.")]
        public string Name { get; set; } = string.Empty;

        [Range(0, 1000000000, ErrorMessage = "Gia phai lon hon hoac bang 0.")]
        public decimal Price { get; set; }

        [Range(0, 100000, ErrorMessage = "So luong phai tu 0 den 100000.")]
        public int Quantity { get; set; }
    }
}
