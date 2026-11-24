namespace APIDemo.Models
{
    public class FileSettings
    {
        public const string SectionName = "FileSettings";

        /// <summary>
        /// Kích thước tối đa cho phép tải lên (tính theo byte). 3MB = 3 * 1024 * 1024 = 3,145,728 bytes.
        /// </summary>
        public long MaxImageSize { get; set; } = 3 * 1024 * 1024;

        /// <summary>
        /// Danh sách đuôi file ảnh hợp lệ (.jpg, .png).
        /// </summary>
        public string[] AllowedExtensions { get; set; } = new[] { ".jpg", ".png" };
    }
}
