using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace APIDemo.Models
{
    public class RefreshToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }

        [Required]
        [MaxLength(128)]
        public string TokenHash { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiresAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(64)]
        public string? CreatedByIp { get; set; }

        public DateTime? RevokedAt { get; set; }

        [MaxLength(128)]
        public string? ReplacedByTokenHash { get; set; }

        [NotMapped]
        public bool IsRevoked => RevokedAt.HasValue;

        [NotMapped]
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

        [NotMapped]
        public bool IsActive => !IsRevoked && !IsExpired;

        [JsonIgnore]
        public User? User { get; set; }
    }
}
