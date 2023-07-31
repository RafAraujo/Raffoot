using RaffootLoader.API.MicrosoftTranslator;
using RaffootLoader.Data;
using RaffootLoader.Enums;
using RaffootLoader.Services;
using System.Reflection;

const string DbName = "SoFifa.db";

var consoleAppPath = Assembly.GetExecutingAssembly().Location;
var basePath = @$"{consoleAppPath}\..\..\..\..\..\..\";
var imagesPath = Path.Combine(basePath, @"Raffoot.UI\res");

var context = new Context(DbName);
var dataExtractor = new SoFifaDataExtractorService(context);
var imageDownloader = new SoFifaImageDownloaderService(context, imagesPath);
var translator = new TranslatorService(context, basePath);
var fileGenerator = new JavaScriptFileGenerator(context, basePath, imagesPath);

WriteInstructions();

string line;

while ((line = Console.ReadLine()) != ((int)ProgramOption.Exit).ToString())
{
    if (!int.TryParse(line, out int option))
    {
        continue;
    }

    switch (option)
    {
        case (int)ProgramOption.DropDatabase:
            context.DropDatabase();
            break;
        case (int)ProgramOption.CreateDatabase:
            await dataExtractor.CreateDatabase();
            break;
        case (int)ProgramOption.GenerateSoFifaServiceFile:
            fileGenerator.GenerateSoFifaServiceFile();
            break;
        case (int)ProgramOption.UpdateTranslations:
            await translator.UpdateTranslations();
            break;
        case (int)ProgramOption.GenerateMultiLanguageFile:
            fileGenerator.GenerateMultiLanguageFile();
            break;
        case (int)ProgramOption.DownloadFlags:
            await imageDownloader.DownloadFlags().ConfigureAwait(false);
            break;
        case (int)ProgramOption.DownloadLogos:
            await imageDownloader.DownloadLogos().ConfigureAwait(false);
            break;
        case (int)ProgramOption.DownloadKits:
            await imageDownloader.DownloadKits().ConfigureAwait(false);
            break;
        case (int)ProgramOption.DownloadPhotos:
            await imageDownloader.DownloadPhotos().ConfigureAwait(false);
            break;
        case (int)ProgramOption.GenerateColorManagerFile:
            fileGenerator.GenerateColorManagerFile();
            break;
    }

    Console.WriteLine();
    WriteInstructions();
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