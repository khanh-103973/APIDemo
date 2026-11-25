namespace APIDemo.DTOs
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
    }
}
