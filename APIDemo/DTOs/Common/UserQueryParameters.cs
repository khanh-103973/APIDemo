namespace APIDemo.DTOs.Common
{
    public class UserQueryParameters
    {
        private const int MaxPageSize = 50; // Giới hạn tối đa 50 bản ghi/trang để chống quá tải server

        public int PageNumber { get; set; } = 1; // Mặc định là trang 1

        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }

        // Search: Từ khóa tìm kiếm chung (Username, Email, FullName...)
        public string? SearchTerm { get; set; }

        // Filter: Lọc theo trường cụ thể (ví dụ: Role Admin/User)
        public string? Role { get; set; }

        // Sort: Sắp xếp theo cột nào và tăng hay giảm dần
        public string? SortBy { get; set; } // Ví dụ: "username", "email", "createdat"
        public bool IsDescending { get; set; } = false; // false = Tăng dần (ASC), true = Giảm dần (DESC)
    }
}