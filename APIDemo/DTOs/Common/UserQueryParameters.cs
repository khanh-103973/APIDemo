using System.ComponentModel.DataAnnotations;

namespace APIDemo.DTOs.Common
{
    public class UserQueryParameters
    {
        public const int MaxPageSize = 50;

        [Range(1, int.MaxValue)]
        public int PageNumber { get; set; } = 1;

        [Range(1, MaxPageSize)]
        public int PageSize { get; set; } = 10;

        // Tìm theo tên đăng nhập, họ tên hoặc email.
        [StringLength(100)]
        public string? SearchTerm { get; set; }

        [StringLength(20)]
        public string? Role { get; set; }

        [Required]
        [RegularExpression("(?i)^(id|username|fullname|email|role|createdat)$",
            ErrorMessage = "SortBy phải là id, username, fullname, email, role hoặc createdat.")]
        public string SortBy { get; set; } = "username";

        public bool IsDescending { get; set; }
    }
}
