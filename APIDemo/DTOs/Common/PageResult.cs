namespace APIDemo.DTOs.Common
{
    // T là kiểu dữ liệu generic (có thể là UserResponseDto, HouseDto, ProductDto,...)
    public class PageResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; } // Tổng số bản ghi thỏa điều kiện tìm kiếm

        // Tự động tính tổng số trang: ví dụ 25 bản ghi, mỗi trang 10 thì có 3 trang
        public int TotalPages => PageSize > 0
            ? (int)Math.Ceiling((double)TotalCount / PageSize)
            : 0;

        // Báo cho Frontend biết có trang trước / trang sau để bật/tắt nút Next/Prev
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;

        public PageResult(List<T> items, int totalCount, int pageNumber, int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            PageNumber = pageNumber;
            PageSize = pageSize;
        }
    }
}