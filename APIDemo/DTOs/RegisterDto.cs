using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Ho ten khong duoc de trong.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ho ten phai tu 2 den 100 ky tu.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email khong duoc de trong.")]
        [EmailAddress(ErrorMessage = "Email khong dung dinh dang.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mat khau khong duoc de trong.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mat khau phai tu 6 den 100 ky tu.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "So dien thoai khong duoc de trong.")]
        [RegularExpression(@"^(0|\+84)[0-9]{9}$", ErrorMessage = "So dien thoai khong dung dinh dang.")]
        public string Phone { get; set; } = string.Empty;
    }
}
