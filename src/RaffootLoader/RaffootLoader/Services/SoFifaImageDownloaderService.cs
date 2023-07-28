using RaffootLoader.Data;
using RaffootLoader.Utils;
using System.Threading.Tasks;

namespace RaffootLoader.Services
{
    public class SoFifaImageDownloaderService
    {
        private readonly Context _context;
        private readonly string _imagesFolder;
        private readonly HttpClient _client;

        public SoFifaImageDownloaderService(Context context, string imagesFolder)
        {
            _context = context;
            _imagesFolder = imagesFolder;
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
                    var filePath = Path.Combine(_imagesFolder, "countries", fileName);

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
                    var filePath = Path.Combine(_imagesFolder, "clubs", fileName);

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

                    var folderPath = Path.Combine(_imagesFolder, "kits", club.ExternalId.ToString());
                    Directory.CreateDirectory(folderPath);

                    foreach (var kit in club.Kits)
                    {
                        var url = kit.Split(' ')[2];
                        var fileName = $"{index}{Path.GetExtension(url)}";
                        var filePath = Path.Combine(folderPath, fileName);

                        if (!File.Exists(filePath))
                        {
                            tasks.Add(DownloadImage(url, filePath));
                        }

                        index++;
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

                var defaultPhoto = Path.Combine(_imagesFolder, "players", "0.svg");

                if (!File.Exists(defaultPhoto))
                {
                    tasks.Add(DownloadImage("https://cdn.sofifa.net/player_0.svg", defaultPhoto));
                }

                foreach (var player in _context.Players)
                {
                    var url = player.Photo.Split(' ')[2];
                    var fileName = $"{player.ExternalId}{Path.GetExtension(url)}";
                    var filePath = Path.Combine(_imagesFolder, "players", fileName);

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

        private static void CreateFolder(string filePath)
        {
            var folder = Path.GetDirectoryName(filePath);
            Directory.CreateDirectory(folder);
        }

        private async Task DownloadImage(string url, string filePath)
        {
            using var stream = await _client.GetStreamAsync(url).ConfigureAwait(false);
            using var fileStream = new FileStream(filePath, FileMode.OpenOrCreate);
            await stream.CopyToAsync(fileStream);
        }
    }
}
