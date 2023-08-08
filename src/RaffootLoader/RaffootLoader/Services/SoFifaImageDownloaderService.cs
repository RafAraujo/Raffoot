using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Interfaces;
using RaffootLoader.Utils;

namespace RaffootLoader.Services
{
    public class SoFifaImageDownloaderService : IImageDownloaderService
    {
        private readonly ISettingsManager _settings;
        private readonly IContext _context;
        private readonly HttpClient _client;

        public SoFifaImageDownloaderService(ISettingsManager settings, IContext context)
        {
            _settings = settings;
            _context = context;
            _client = new(new HttpClientHandler { AllowAutoRedirect = false });
        }

        public async Task DownloadFlags()
        {
            var tasks = new List<Task>();

            try
            {
                Console.WriteLine("Downloading flags...");

                foreach (var country in _context.Countries)
                {

                    var url = country.Flag.Split(' ')[2];
                    var fileName = $"{country.Name}{Path.GetExtension(url)}";
                    var filePath = Path.Combine(_settings.ImagesPath, "countries", fileName);

                    if (!File.Exists(filePath))
                    {
                        CreateFolder(filePath);
                        tasks.Add(DownloadImage(url, filePath));
                    }
                }

                await Task.WhenAll(tasks).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
            finally
            {
                Console.WriteLine("\tSuccess: {0}", tasks.Count(t => t.IsCompletedSuccessfully));
                Console.WriteLine("\tFailed: {0}", tasks.Count(t => t.IsFaulted));
                Console.WriteLine("\tTotal: {0}", tasks.Count);
            }
        }

        public async Task DownloadLogos()
        {
            var tasks = new List<Task>();

            try
            {
                Console.WriteLine("Downloading logos...");

                foreach (var club in _context.Clubs)
                {
                    var url = club.Logo.Split(' ')[2];
                    var fileName = $"{club.ExternalId}{Path.GetExtension(url)}";
                    var filePath = Path.Combine(_settings.ImagesPath, "clubs", fileName);

                    if (!File.Exists(filePath))
                    {
                        CreateFolder(filePath);
                        tasks.Add(DownloadImage(url, filePath));
                    }
                }

                await Task.WhenAll(tasks).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
            finally
            {
                Console.WriteLine("\tSuccess: {0}", tasks.Count(t => t.IsCompletedSuccessfully));
                Console.WriteLine("\tFailed: {0}", tasks.Count(t => t.IsFaulted));
                Console.WriteLine("\tTotal: {0}", tasks.Count);
            }
        }

        public async Task DownloadKits()
        {
            var tasks = new List<Task>();

            try
            {
                Console.WriteLine("Downloading kits...");

                foreach (var club in _context.Clubs)
                {
                    var index = 1;

                    var folderPath = Path.Combine(_settings.ImagesPath, "kits", club.ExternalId.ToString());
                    Directory.CreateDirectory(folderPath);

                    foreach (var kit in club.Kits)
                    {
                        var url = kit.Split(' ')[2];
                        var fileName = $"{index++}{Path.GetExtension(url)}";
                        var filePath = Path.Combine(folderPath, fileName);

                        if (!File.Exists(filePath))
                        {
                            tasks.Add(DownloadImage(url, filePath));
                        }
                    }
                }

                await Task.WhenAll(tasks).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
            finally
            {
                Console.WriteLine("\tSuccess: {0}", tasks.Count(t => t.IsCompletedSuccessfully));
                Console.WriteLine("\tFailed: {0}", tasks.Count(t => t.IsFaulted));
                Console.WriteLine("\tTotal: {0}", tasks.Count);
            }
        }

        public async Task DownloadPhotos()
        {
            var tasks = new List<Task>();

            try
            {
                Console.WriteLine("Downloading photos...");

                var defaultPhotoPath = Path.Combine(_settings.ImagesPath, "players", "0.svg");

                if (!File.Exists(defaultPhotoPath))
                {
                    CreateFolder(defaultPhotoPath);
                    await DownloadImage("https://cdn.sofifa.net/player_0.svg", defaultPhotoPath);
                }

                foreach (var player in _context.Players)
                {
                    var url = player.Photo.Split(' ')[2];
                    var fileName = $"{player.ExternalId}{Path.GetExtension(url)}";
                    var filePath = Path.Combine(_settings.ImagesPath, "players", fileName);

                    if (File.Exists(filePath))
                    {
                        player.HasPhoto = true;
                    }
                    else
                    {
                        CreateFolder(filePath);
                        tasks.Add(DownloadPhoto(player, url, filePath));
                    }
                }

                await Task.WhenAll(tasks).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
            finally
            {

                Console.WriteLine("\tSuccess: {0}", tasks.Count(t => t.IsCompletedSuccessfully));
                Console.WriteLine("\tFailed: {0}", tasks.Count(t => t.IsFaulted));
                Console.WriteLine("\tTotal: {0}", tasks.Count);
            }
        }

        private static void CreateFolder(string filePath)
        {
            var folder = Path.GetDirectoryName(filePath);
            Directory.CreateDirectory(folder);
        }

        private async Task DownloadPhoto(Player player, string url, string filePath)
        {
            await DownloadImage(url, filePath);
            player.HasPhoto = true;
        }

        private async Task DownloadImage(string url, string filePath)
        {
            using var stream = await _client.GetStreamAsync(url).ConfigureAwait(false);
            using var fileStream = new FileStream(filePath, FileMode.OpenOrCreate);
            await stream.CopyToAsync(fileStream);
        }
    }
}
