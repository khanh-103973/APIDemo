namespace APIDemo.DTOs
{
    public class ContractResponseDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal Deposit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Pending";
        public int? HouseId { get; set; }
        public string? HouseTitle { get; set; }
        public int? TenantId { get; set; }
        public string? TenantName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
