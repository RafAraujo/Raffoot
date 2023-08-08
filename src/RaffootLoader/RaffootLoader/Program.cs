using Microsoft.Extensions.DependencyInjection;
using RaffootLoader.Data;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Enums;
using RaffootLoader.Services;
using RaffootLoader.Services.Interfaces;
using System.Reflection;

var serviceCollection = new ServiceCollection();
ConfigureServices(serviceCollection);
var serviceProvider = serviceCollection.BuildServiceProvider();

var context = serviceProvider.GetService<IContext>();
var dataExtractor = serviceProvider.GetService<IDataExtractorService>();
var imageDownloader = serviceProvider.GetService<IImageDownloaderService>();
var translator = serviceProvider.GetService<ITranslatorService>();
var fileGenerator = serviceProvider.GetService<IJavaScriptFileGenerator>();

WriteInstructions();

string line;

while ((line = Console.ReadLine()) != ((int)ProgramOption.Exit).ToString())
{
    if (!int.TryParse(line, out int option))
    {
        continue;
    }

    switch ((ProgramOption)option)
    {
        case ProgramOption.DropDatabase:
            context.DropDatabase();
            break;
        case ProgramOption.CreateDatabase:
            await dataExtractor.CreateDatabase();
            break;
        case ProgramOption.DownloadFlags:
            await imageDownloader.DownloadFlags().ConfigureAwait(false);
            break;
        case ProgramOption.DownloadLogos:
            await imageDownloader.DownloadLogos().ConfigureAwait(false);
            break;
        case ProgramOption.DownloadKits:
            await imageDownloader.DownloadKits().ConfigureAwait(false);
            break;
        case ProgramOption.DownloadPhotos:
            await imageDownloader.DownloadPhotos().ConfigureAwait(false);
            break;
        case ProgramOption.UpdateClubsColors:
            dataExtractor.UpdateClubsColors();
            break;
        case ProgramOption.UpdatePlayerHasPhotoFlag:
            dataExtractor.UpdatePlayerHasPhotoFlag();
            break;
        case ProgramOption.GenerateSoFifaServiceFile:
            fileGenerator.GenerateSoFifaServiceFile();
            break;

        case ProgramOption.UpdateTranslations:
            await translator.UpdateTranslations();
            break;
        case ProgramOption.GenerateMultiLanguageFile:
            fileGenerator.GenerateMultiLanguageFile();
            break;
    }

    Console.WriteLine();
    WriteInstructions();
}

// https://stackoverflow.com/questions/70628314/injecting-primitive-type-in-constructor-of-generic-type-using-microsoft-di
static void ConfigureServices(IServiceCollection services)
{
    var consoleAppPath = Assembly.GetExecutingAssembly().Location;
    var basePath = @$"{consoleAppPath}\..\..\..\..\..\..\";
    var dbPath = Path.Combine(basePath, @"RaffootLoader\Raffoot.db");
    var imagesPath = Path.Combine(basePath, @"Raffoot.UI\res\");

    services.AddSingleton<ISettingsManager, SettingsManager>(sp => new SettingsManager(basePath, dbPath, imagesPath));

    services.AddScoped<IContext, Context>();
    services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
    services.AddScoped<IDataExtractorService, SoFifaDataExtractorService>();
    services.AddScoped<IImageDownloaderService, SoFifaImageDownloaderService>();
    services.AddScoped<ITranslatorService, TranslatorService>();
    services.AddScoped<IJavaScriptFileGenerator, JavaScriptFileGenerator>();
}

static void WriteInstructions()
{
    Console.ResetColor();
    Console.WriteLine("Choose:");

    foreach (ProgramOption value in Enum.GetValues(typeof(ProgramOption)))
    {
        Console.WriteLine("\t[{0}] - {1}", (int)value, value);
    }
    Console.WriteLine();
}