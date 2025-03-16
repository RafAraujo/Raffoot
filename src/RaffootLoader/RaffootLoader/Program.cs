using Microsoft.Extensions.DependencyInjection;
using RaffootLoader;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.Fifa;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.FM;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.PES;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Application.Services;
using RaffootLoader.Application.Services.DataExtractors.Fifa;
using RaffootLoader.Application.Services.DataExtractors.FM;
using RaffootLoader.Application.Services.DataExtractors.PES;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Infrastructure.CrossCutting.Utils;
using RaffootLoader.Infrastructure.Data;
using RaffootLoader.Infrastructure.WebScrapers;
using System.Reflection;

var serviceCollection = new ServiceCollection();
ConfigureServices(serviceCollection);
var serviceProvider = serviceCollection.BuildServiceProvider();

var context = serviceProvider.GetService<IContext>();
var databaseCreator = serviceProvider.GetService<IDatabaseCreatorService>();
var imageService = serviceProvider.GetService<IImageInfoService>();
var imageDownloader = serviceProvider.GetService<IImageDownloaderService>();
var imageAnalysis = serviceProvider.GetService<IImageAnalysisService>();
var fileGenerator = serviceProvider.GetService<IJavaScriptFileGeneratorService>();
var settings = serviceProvider.GetService<ISettings>();

WriteInstructions(settings);

string line;

while ((line = Console.ReadLine()) != ((int)ProgramOption.Exit).ToString())
{
    if (!int.TryParse(line, out int option))
        continue;

    switch ((ProgramOption)option)
    {
        case ProgramOption.DoAll:
            await DoAll().ConfigureAwait(false);
            break;
        case ProgramOption.ChangeDataSource:
            ChangeDataSource(settings);
            break;
        case ProgramOption.ChangeYear:
            ChangeYear(settings);
            break;
        case ProgramOption.CreateDatabase:
            await databaseCreator.CreateDatabase();
            break;
        case ProgramOption.DownloadImages:
            await imageDownloader.DownloadImages().ConfigureAwait(false);
            break;
        case ProgramOption.UpdateClubsColors:
            imageAnalysis.UpdateClubsColors();
            break;
        case ProgramOption.GenerateFifaServiceFile:
            fileGenerator.GenerateFifaServiceFile();
            break;
    }

    Console.WriteLine();
    WriteInstructions(settings);
}

async Task DoAll()
{
    try
    {
        List<Func<ISettings, bool>> methods = [ChangeDataSource, ChangeYear];
        foreach (var method in methods)
            if (!method(settings))
                return;

        await databaseCreator.CreateDatabase().ConfigureAwait(false);
        await imageDownloader.DownloadImages().ConfigureAwait(false);
        imageAnalysis.UpdateClubsColors();
        fileGenerator.GenerateFifaServiceFile();
    }
    catch (OperationCanceledException) { }
    catch (Exception ex)
    {
        ConsoleUtils.ShowException(ex);
    }
}

// https://stackoverflow.com/questions/70628314/injecting-primitive-type-in-constructor-of-generic-type-using-microsoft-di
static void ConfigureServices(IServiceCollection services)
{
    var consoleAppPath = Assembly.GetExecutingAssembly().Location;
    var gameBaseFolder = @$"{consoleAppPath}\..\..\..\..\..\..\";
    var consoleAppFolder = Path.Combine(gameBaseFolder, @"RaffootLoader\");

    services.AddSingleton<ISettings, Settings>(sp => new Settings(gameBaseFolder, consoleAppFolder));

    services.AddSingleton<IHttpClientWebScraper, HttpClientWebScraper>();
    services.AddSingleton<IPlaywrightWebScraper, PlaywrightWebScraper>();
    services.AddSingleton<IPuppeteerWebScraper, PuppeteerWebScraper>();

    services.AddScoped<IFifaIndexDataExtractorService, FifaIndexDataExtractorService>();
    services.AddScoped<ISoFifaDataExtractorService, SoFifaDataExtractorService>();
    services.AddScoped<IFmInsideDataExtractorService, FmInsideDataExtractorService>();
    services.AddScoped<IPesMasterDataExtractorService, PesMasterDataExtractorService>();
    services.AddScoped<IWePesStatsDataExtractorService, WePesStatsDataExtractorService>();

    services.AddScoped<IContext, Context>();
    services.AddScoped<IRepository, Repository>();
    services.AddScoped<IDatabaseCreatorService, DatabaseCreatorService>();
    services.AddScoped<IHtmlDocumentService, HtmlDocumentService>();
    services.AddScoped<IImageInfoService, ImageInfoService>();
    services.AddScoped<IImageDownloaderService, ImageDownloaderService>();
    services.AddScoped<IImageAnalysisService, ImageAnalysisService>();
    services.AddScoped<IJavaScriptFileGeneratorService, JavaScriptFileGeneratorService>();

    services.AddHttpClient();
}

static void WriteInstructions(ISettings settings)
{
    Console.ResetColor();
    Console.WriteLine("Choose (year {0}):", settings.Year);

    foreach (var value in Enum.GetValues<ProgramOption>().Cast<ProgramOption>().OrderBy(po => (int)po))
        Console.WriteLine("\t[{0}] - {1}", (int)value, value);

    Console.WriteLine();
}

static bool ChangeDataSource(ISettings settings)
{
    Console.WriteLine("\nEnter the data source");
    foreach (var value in Enum.GetValues<DataSource>())
        Console.WriteLine("{0} - {1}", (int)value, value.ToString());

    if (int.TryParse(Console.ReadLine(), out int dataSource))
    {
        if (Enum.IsDefined(typeof(DataSource), dataSource))
        {
            settings.DataSource = (DataSource)dataSource;
            return true;
        }
    }

    ConsoleUtils.WriteError("Invalid option");
    return false;
}

static bool ChangeYear(ISettings settings)
{
    Console.WriteLine("\n{0} ({1} - {2}):", "Enter the year", settings.MinYear, settings.MaxYear);

    if (int.TryParse(Console.ReadLine(), out int year))
    {
        if (year >= settings.MinYear && year <= settings.MaxYear)
        {
            settings.Year = year;
            return true;
        }
    }

    ConsoleUtils.WriteError("Invalid option");
    return false;
}