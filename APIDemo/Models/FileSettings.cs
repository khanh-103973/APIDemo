namespace APIDemo.Models
{
    public class FileSettings
    {
        public const string SectionName = "FileSettings";

        public long MaxImageSize { get; set; } = 3 * 1024 * 1024; // 3MB

        public string[] AllowedExtensions { get; set; } = { ".jpg", ".jpeg", ".png" };
    }
}
