using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class HouseDto
    {
        [Required(ErrorMessage = "Tieu de khong duoc de trong.")]
        [StringLength(150, MinimumLength = 5, ErrorMessage = "Tieu de phai tu 5 den 150 ky tu.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mo ta khong duoc de trong.")]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Mo ta phai tu 10 den 1000 ky tu.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Dia chi khong duoc de trong.")]
        [StringLength(250, MinimumLength = 5, ErrorMessage = "Dia chi phai tu 5 den 250 ky tu.")]
        public string Address { get; set; } = string.Empty;

        [Range(1, 1000000000, ErrorMessage = "Gia thue phai lon hon 0.")]
        public decimal Price { get; set; }

        [Range(5, 1000, ErrorMessage = "Dien tich phai tu 5 den 1000 m2.")]
        public double Area { get; set; }

        [Range(1, 20, ErrorMessage = "So phong ngu phai tu 1 den 20.")]
        public int Bedrooms { get; set; }

        [RegularExpression(@"^$|^https?://.+", ErrorMessage = "ImageUrl phai la duong dan http hoac https.")]
        public string ImageUrl { get; set; } = string.Empty;
    }
}
