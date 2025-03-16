using RaffootLoader.Application.DTO;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Models;

namespace RaffootLoader.Application.Services
{
    public class ImageInfoService(ISettings settings) : IImageInfoService
    {
        private readonly string defaultExtension = ".png";

        public ImageInfoDto GetFlag(Country country)
        {
            if (string.IsNullOrEmpty(country.Flag))
                return new ImageInfoDto(null, null);

            var url = country.Flag.Contains(' ') ? country.Flag.Split(' ')[2] : country.Flag;
            var fileName = $"{country.Name}{Path.GetExtension(url)}";
            var filePath = Path.Combine(settings.ImageFolder, "countries", fileName);

            var dto = new ImageInfoDto(url, filePath);
            return dto;
        }

        public ImageInfoDto GetLogo(Club club)
        {
            if (string.IsNullOrEmpty(club.Logo))
                return new ImageInfoDto(null, null);

            var url = club.Logo.Contains(' ') ? club.Logo.Split(' ')[2] : club.Logo;
            var name = club.GetFileName();

            var extension = Path.GetExtension(url) ?? defaultExtension;
            var fileName = $"{name}{extension}";
            var filePath = Path.Combine(settings.ImageFolder, "clubs", club.Country, fileName);

            var dto = new ImageInfoDto(url, filePath);
            return dto;
        }

        public IEnumerable<ImageInfoDto> GetKits(Club club)
        {
            var dtos = new List<ImageInfoDto>();

            if (club.Kits.Count == 0)
                return dtos;

            var baseFolder = Path.Combine(settings.ImageFolder, "kits", settings.Year.ToString());
            var countryFolder = Path.Combine(baseFolder, club.Country);
            var clubFolder = Path.Combine(countryFolder, club.GetFileName());

            for (var i = 0; i < club.Kits.Count; i++)
            {
                var url = club.Kits[i].Split(' ')[2];
                var fileName = $"{i + 1}{Path.GetExtension(url)}";
                var filePath = Path.Combine(clubFolder, fileName);

                var dto = new ImageInfoDto(url, filePath);
                dtos.Add(dto);
            }

            return dtos;
        }

        public ImageInfoDto GetPhoto(Player player)
        {
            if (string.IsNullOrEmpty(player.Photo))
                return new ImageInfoDto(null, null);

            var url = player.Photo.Contains(' ') ? player.Photo.Split(' ')[2] : player.Photo;
            var fileName = $"{player.Id}{Path.GetExtension(url)}";
            var filePath = Path.Combine(settings.ImageFolder, "players", settings.Year.ToString(), fileName);

            var dto = new ImageInfoDto(url, filePath);
            return dto;
        }
    }
}
