namespace RaffootLoader.Application.Interfaces.Services
{
    public interface IJavaScriptFileGeneratorService
    {
        void GenerateFifaServiceFile(bool minify = false);
    }
}