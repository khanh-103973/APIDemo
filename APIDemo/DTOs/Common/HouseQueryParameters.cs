namespace APIDemo.DTOs.Common
{
    public class HouseQueryParameters
    {
        private const int MaxPageSize = 50; // Giới hạn tối đa 50 bản ghi/trang để chống quá tải server

        private int _pageNumber = 1;
        public int PageNumber
        {
            get => _pageNumber;
            set => _pageNumber = value < 1 ? 1 : value;
        }

        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 10 : value);
        }

        // Search: Tìm kiếm tương đối theo Title hoặc Address
        public string? SearchTerm { get; set; }

        // Filter: Lọc theo trạng thái, khoảng giá và số phòng ngủ
        public string? Status { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? Bedrooms { get; set; }

        // Sort: Hỗ trợ "price", "area", "title"
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; } = false; // false = Tăng dần (ASC), true = Giảm dần (DESC)
    }
}
