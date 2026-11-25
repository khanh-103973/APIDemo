namespace APIDemo.Models
{
    public interface IAuditableSoftDelete
    {
        bool IsDeleted { get; set; }
        DateTime? DeletedAt { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
    }
}
