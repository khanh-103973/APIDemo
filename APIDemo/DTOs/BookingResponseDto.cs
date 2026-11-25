namespace APIDemo.DTOs
{
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int HouseId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Pending";
        public string? HouseTitle { get; set; }
        public string? TenantName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
