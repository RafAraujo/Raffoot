﻿using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.DTO;

namespace RaffootLoader.Services
{
	public class ImageService(ISettings settings, IContext context) : IImageService
	{
		private readonly IEnumerable<League> _leagues = context.Leagues.ToList();
		private readonly string _defaultExtension = ".png";

		public ImageInfoDto GetFlag(Country country)
		{
			var dto = new ImageInfoDto(null, null);

			if (string.IsNullOrEmpty(country.Flag))
			{
				return dto;
			}
			
			var url = country.Flag.Split(' ')[2];
			var fileName = $"{country.Name}{Path.GetExtension(url)}";
			var filePath = Path.Combine(settings.ImagesFolder, "countries", fileName);

			dto = new ImageInfoDto(url, filePath);
			return dto;
		}

		public ImageInfoDto GetLogo(Club club)
		{
			var dto = new ImageInfoDto(null, null);
			
			if (string.IsNullOrEmpty(club.Logo))
			{
				return dto;
			}

			var url = club.Logo.Split(' ')[2];
			var countryName = _leagues.Single(l => l.ExternalId == club.LeagueId).Country;
			var name = $"{countryName} - {club.GetFileName()}";

			var extension = Path.GetExtension(url) ?? _defaultExtension;
			var fileName = $"{name}{extension}";
			var filePath = Path.Combine(settings.ImagesFolder, "clubs", fileName);
			
			dto = new ImageInfoDto(url, filePath);
			return dto;
		}

		public IEnumerable<ImageInfoDto> GetKits(Club club)
		{
			var dtos = new List<ImageInfoDto>();

			if (club.Kits.Count == 0)
			{
				return dtos;
			}

			var country = _leagues.Single(l => club.LeagueId == l.ExternalId).Country;
			var baseFolder = Path.Combine(settings.ImagesFolder, "kits", settings.Year.ToString());
			var countryFolder = Path.Combine(baseFolder, country);

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
			var dto = new ImageInfoDto(null, null);

			if (string.IsNullOrEmpty(player.Photo))
			{
				return dto;
			}
			
			var url = player.Photo.Split(' ')[2];
			var fileName = $"{player.Id}{Path.GetExtension(url)}";
			var filePath = Path.Combine(settings.ImagesFolder, "players", settings.Year.ToString(), fileName);

			dto = new ImageInfoDto(url, filePath);
			return dto;
		}

		public void CheckClubsWithoutLogo()
		{
			foreach (var club in context.Clubs)
			{
				var imageInfo = GetLogo(club);
				if (!File.Exists(imageInfo.FilePath))
					Console.WriteLine("{0} without logo", club.Name);
			}
		}
	}
}