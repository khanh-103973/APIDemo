using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Vui lòng nhập mật khẩu hiện tại.")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu mới phải từ 6 đến 100 ký tự.")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu mới.")]
        [Compare(nameof(NewPassword), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    public class RefreshTokenRequestDto
    {
        public string? RefreshToken { get; set; }
    }
}
