﻿using LiteDB;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Utils;

namespace RaffootLoader.Data
{
    public class Context(
        ISettings settings,
        IRepository<League> leagueRepository,
        IRepository<Club> clubRepository,
        IRepository<Player> playerRepository,
        IRepository<Country> countryRepository,
        IRepository<Translation> translationRepository) : IContext
    {
        private readonly ISettings _settings = settings;

        private readonly IRepository<Club> _clubRepository = clubRepository;
        private readonly IRepository<Country> _countryRepository = countryRepository;
        private readonly IRepository<League> _leagueRepository = leagueRepository;
        private readonly IRepository<Player> _playerRepository = playerRepository;
        private readonly IRepository<Translation> _translationRepository = translationRepository;

        private IEnumerable<Club> _clubs;
        private IEnumerable<Country> _countries;
        private IEnumerable<League> _leagues;
        private IEnumerable<Player> _players;
        private IEnumerable<Position> _positions;

        public IEnumerable<Club> Clubs
        {
            get => _clubs ??= _clubRepository.GetAll();
        }

        public IEnumerable<League> Leagues
        {
            get => _leagues ??= _leagueRepository.GetAll();
        }

        public IEnumerable<Player> Players
        {
            get => _players ??= _playerRepository.GetAll();
        }

        public IEnumerable<Country> Countries
        {
            get => _countries ??= _countryRepository.GetAll();
        }

        public IEnumerable<Position> Positions
        {
            get => _positions ??= new[]
            {
                new Position("Goalkeeper", "GK"),
                new Position("Centre-Back", "CB"),
                new Position("Left-Back", "LB"),
                new Position("Right-Back", "RB"),
                new Position("Left Wing-Back", "LWB"),
                new Position("Right Wing-Back", "RWB"),
                new Position("Defensive Midfielder", "CDM"),
                new Position("Centre Midfielder", "CM"),
                new Position("Left Midfielder", "LM"),
                new Position("Right Midfielder", "RM"),
                new Position("Attacking Midfielder", "CAM"),
                new Position("Left Winger", "LW"),
                new Position("Right Winger", "RW"),
                new Position("Centre Forward", "CF"),
                new Position("Striker", "ST"),
            };
        }

        public static IEnumerable<string> Languages
        {
            get => new[] { "de", "en", "es", "fr", "it", "nl", "pt-BR", };
        }

        public IEnumerable<Translation> Translations
        {
            get => _translationRepository.GetAll();
        }

        public bool DatabaseExists() => File.Exists(_settings.DbPath);

        public void DropDatabase()
        {
            try
            {
                Console.WriteLine("Dropping database...");

                if (File.Exists(_settings.DbPath))
                {
                    File.Move(_settings.DbPath, $"{_settings.DbPath}.old", true);
                }
                File.Delete(_settings.DbPath);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
        }

        public bool DropCollection(string name)
        {
            using var db = new LiteDatabase(_settings.DbPath);
            return db.DropCollection(name);
        }

        public void InsertMany<T>(IEnumerable<T> items) where T : Entity
        {
            var repository = new Repository<T>(_settings);
            repository.InsertMany(items);
        }
    }
}
