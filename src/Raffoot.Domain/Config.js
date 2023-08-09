const Config = (function () {
    const ResourcesFolder = 'res';
    
    return {
        version: '1.0',
        defaultFirstYear: new Date().getFullYear(),
        indexedDbName: 'Raffoot',

        files: {
            defaultPlayerPhoto: `${ResourcesFolder}/players/0.svg`,
        },
        folders: {
            flagsFolder: `${ResourcesFolder}/countries`,
            kitsFolder: `${ResourcesFolder}/kits`,
            logosFolder: `${ResourcesFolder}/clubs`,
            photosFolder: `${ResourcesFolder}/players`,
        },

        colors: {
            blue: '#007bff',
            gray: '#6c757d',
            green: '#28a745',
            orange: '#fd7e14',
            purple: '#6f42c1',
            red: '#dc3545',
            yellow: '#ffc107'
        },

        cup: {
            groupClubCount: 4,
            groupQualifiedClubCount: 2
        },

        continentalCup: {
            maxClubCount: 32,
        },

        nationalCup: {
            maxClubCount: 64,
        },

        nationalLeague: {
            maxClubCount: 18,
            minClubCount: 8,
            maxDivisionCount: 4,
        },

        stadiumTicketPrice: 40,
    }
})();