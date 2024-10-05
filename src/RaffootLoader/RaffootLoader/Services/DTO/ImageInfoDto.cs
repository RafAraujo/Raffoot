namespace RaffootLoader.Services.DTO
{
    public class ImageInfoDto(string url, string filePath)
    {
        public string Url { get; set; } = url;
        public string FilePath { get; set; } = filePath;
    }
}
