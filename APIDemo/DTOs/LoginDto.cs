using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Username khong duoc de trong.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username phai tu 3 den 50 ky tu.")]
        public string Username { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Email khong dung dinh dang.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mat khau khong duoc de trong.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mat khau phai tu 6 den 100 ky tu.")]
        public string Password { get; set; } = string.Empty;
    }
}
