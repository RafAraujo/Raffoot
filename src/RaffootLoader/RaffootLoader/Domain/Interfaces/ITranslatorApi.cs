using RaffootLoader.Domain.Models;

namespace RaffootLoader.Domain.Interfaces
{
    public interface ITranslatorApi
    {
        Task<IEnumerable<Translation>> Translate(IEnumerable<string> texts, IEnumerable<string> targetLanguages, string sourceLanguage);
    }
}