using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace APIDemo.Models
{
    public class House
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [Range(1, 1000000000)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        [Range(5, 1000)]
        public double Area { get; set; }

        [Required]
        [Range(1, 20)]
        public int Bedrooms { get; set; }

        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Available";

        [Required]
        [ForeignKey(nameof(Owner))]
        public int OwnerId { get; set; }

        [JsonIgnore]
        public User? Owner { get; set; }

        [JsonIgnore]
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
