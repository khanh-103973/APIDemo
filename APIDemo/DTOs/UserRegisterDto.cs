using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class UserRegisterDto
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Tên đăng nhập phải từ 3 đến 50 ký tự.")]
        [RegularExpression(@"^[a-zA-Z0-9._]+$", ErrorMessage = "Tên đăng nhập chỉ gồm chữ, số, dấu chấm và gạch dưới.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên không được để trống.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Họ tên phải từ 2 đến 100 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email không được để trống.")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 đến 100 ký tự.")]
        public string Password { get; set; } = string.Empty;

        [RegularExpression(@"^(0|\+84)[0-9]{9}$", ErrorMessage = "Số điện thoại không đúng định dạng (VD: 0912345678).")]
        public string Phone { get; set; } = "0912345678";

        [RegularExpression("^(Admin|Tenant|Owner)$", ErrorMessage = "Role chỉ nhận Admin, Tenant hoặc Owner.")]
        public string Role { get; set; } = "Tenant";

        public string? Department { get; set; } = "General";

        public DateTime? DateOfBirth { get; set; }
    }
}
