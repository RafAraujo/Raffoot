using Microsoft.Extensions.DependencyInjection;
using RaffootLoader;
using RaffootLoader.Data;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Integration.GoogleTranslator;
using RaffootLoader.Services;
using RaffootLoader.Utils;
using System.Reflection;

var serviceCollection = new ServiceCollection();
ConfigureServices(serviceCollection);
var serviceProvider = serviceCollection.BuildServiceProvider();

var context = serviceProvider.GetService<IContext>();
var databaseCreator = serviceProvider.GetService<IDatabaseCreatorService>();
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
		case ProgramOption.CheckClubsWithoutLogo:
			imageService.CheckClubsWithoutLogo();
			break;
	}

	Console.WriteLine();
	WriteInstructions(settings);
}

async Task DoAll()
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

// https://stackoverflow.com/questions/70628314/injecting-primitive-type-in-constructor-of-generic-type-using-microsoft-di
static void ConfigureServices(IServiceCollection services)
{
	var consoleAppPath = Assembly.GetExecutingAssembly().Location;
	var gameBaseFolder = @$"{consoleAppPath}\..\..\..\..\..\..\";
	var consoleAppFolder = Path.Combine(gameBaseFolder, @"RaffootLoader\");

	services.AddSingleton<ISettings, Settings>(sp => new Settings(gameBaseFolder, consoleAppFolder));

	services.AddScoped<IContext, Context>();
	services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
	services.AddScoped<IDatabaseCreatorService, DatabaseCreatorService>();
	services.AddScoped<IImageService, ImageService>();
	services.AddScoped<IImageDownloaderService, ImageDownloaderService>();
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
		Console.WriteLine("\t[{0}] - {1}", (int)value, value);

	Console.WriteLine();
}

static bool ChangeDataSource(ISettings settings)
{
	Console.WriteLine("\nEnter the data source");
	foreach (DataSource value in Enum.GetValues(typeof(DataSource)))
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