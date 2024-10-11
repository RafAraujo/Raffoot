using Microsoft.Extensions.DependencyInjection;
using RaffootLoader;
using RaffootLoader.Data;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Integration.GoogleTranslator;
using RaffootLoader.Services;
using RaffootLoader.Services.Fifa;
using RaffootLoader.Utils;
using System.Reflection;

var serviceCollection = new ServiceCollection();
ConfigureServices(serviceCollection);
var serviceProvider = serviceCollection.BuildServiceProvider();

var context = serviceProvider.GetService<IContext>();
var databaseCreator = serviceProvider.GetService<IDatabaseCreator>();
var imageService = serviceProvider.GetService<IImageService>();
var imageDownloader = serviceProvider.GetService<IImageDownloaderService>();
var imageAnalysis = serviceProvider.GetService<IImageAnalysisService>();
var fileGenerator = serviceProvider.GetService<IJavaScriptFileGenerator>();
var settings = serviceProvider.GetService<ISettings>();

WriteInstructions(settings);

string line;

while ((line = Console.ReadLine()) != ((int)ProgramOption.Exit).ToString())
{
	if (!int.TryParse(line, out int option))
	{
		continue;
	}

	switch ((ProgramOption)option)
	{
		case ProgramOption.DoAll:
			await DoAll().ConfigureAwait(false);
			break;
		case ProgramOption.ChangeYear:
			ChangeYear(settings);
			break;
		case ProgramOption.DropDatabase:
			context.DropDatabase();
			break;
		case ProgramOption.CreateDatabase:
			await databaseCreator.CreateDatabase();
			break;
		case ProgramOption.DownloadFlags:
			await imageDownloader.DownloadImages(ImageType.Flag).ConfigureAwait(false);
			break;
		case ProgramOption.DownloadLogos:
			await imageDownloader.DownloadImages(ImageType.Logo).ConfigureAwait(false);
			break;
		case ProgramOption.DownloadPhotos:
			await imageDownloader.DownloadImages(ImageType.Photo).ConfigureAwait(false);
			break;
		case ProgramOption.DownloadKits:
			await imageDownloader.DownloadImages(ImageType.Kit).ConfigureAwait(false);
			break;
		case ProgramOption.UpdateClubsColors:
			imageAnalysis.UpdateClubsColors();
			break;
		case ProgramOption.GenerateFifaServiceFile:
			fileGenerator.GenerateFifaServiceFile();
			break;
		case ProgramOption.CheckClubsWithoutLogo:
			imageService.CheckClubsWithoutLogo();
			break;
	}

	Console.WriteLine();
	WriteInstructions(settings);
}

async Task DoAll()
{
	var success = ChangeYear(settings);
	if (!success)
	{
		return;
	}
	context.DropDatabase();
	await databaseCreator.CreateDatabase();
	foreach (ImageType imageType in Enum.GetValues(typeof(ImageType)))
	{
		await imageDownloader.DownloadImages(imageType).ConfigureAwait(false);
	}
	imageAnalysis.UpdateClubsColors();
	fileGenerator.GenerateFifaServiceFile();
}

// https://stackoverflow.com/questions/70628314/injecting-primitive-type-in-constructor-of-generic-type-using-microsoft-di
static void ConfigureServices(IServiceCollection services)
{
	var consoleAppPath = Assembly.GetExecutingAssembly().Location;
	var baseFolder = @$"{consoleAppPath}\..\..\..\..\..\..\";
	var dbFolder = Path.Combine(baseFolder, @"RaffootLoader\");
	var imagesFolder = Path.Combine(baseFolder, @"Raffoot.UI\Pages\res\image\");
	var year = GetMaxYear();

	services.AddSingleton<ISettings, Settings>(sp => new Settings(baseFolder, dbFolder, imagesFolder, year));

	services.AddScoped<IContext, Context>();
	services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
	services.AddScoped<IDatabaseCreator, DatabaseCreatorService>();
	services.AddScoped<IFifaDataExtractorService, SoFifaDataExtractorService>();
	services.AddScoped<IImageService, ImageService>();
	services.AddScoped<IImageDownloaderService, SoFifaImageDownloaderService>();
	services.AddScoped<IImageAnalysisService, ImageAnalysisService>();
	services.AddScoped<ITranslatorApi, GoogleTranslator>();
	services.AddScoped<IJavaScriptFileGenerator, JavaScriptFileGenerator>();

	services.AddHttpClient();
	services.AddAutoMapper(Assembly.GetExecutingAssembly());
}

static void WriteInstructions(ISettings settings)
{
	Console.ResetColor();
	Console.WriteLine("Choose (year {0}):", settings.Year);

	foreach (ProgramOption value in Enum.GetValues(typeof(ProgramOption)).Cast<ProgramOption>().OrderBy(po => (int)po))
	{
		Console.WriteLine("\t[{0}] - {1}", (int)value, value);
	}
	Console.WriteLine();
}

static bool ChangeYear(ISettings settings)
{
	Console.WriteLine("\n{0} ({1} - {2}):", "Enter the year", GetMinYear(), GetMaxYear());

	if (int.TryParse(Console.ReadLine(), out int year))
	{
		if (year >= GetMinYear() && year <= GetMaxYear())
		{
			settings.Year = year;
			return true;
		}
	}

	ConsoleUtils.WriteError("Invalid year");
	return false;
}

static int GetMinYear() => 2005;
static int GetMaxYear() => DateTime.Now.Month < 9 ? DateTime.Now.Year : DateTime.Now.Year + 1;