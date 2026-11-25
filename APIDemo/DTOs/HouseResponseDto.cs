namespace APIDemo.DTOs
{
    public class HouseResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public double Area { get; set; }
        public int Bedrooms { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Status { get; set; } = "Available";
        public int OwnerId { get; set; }
        public string? OwnerName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
