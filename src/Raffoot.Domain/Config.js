const Config = (function () {
    const ResourcesFolder = 'res';
    
    return {
        version: '1.0',
        defaultFirstYear: new Date().getFullYear(),
        indexedDbName: 'Raffoot',
        colors: {
            blue: { hex: '#007bff', class: 'primary' },
            gray: { hex: '#6c757d', class: 'secondary' },
            green: { hex: '#28a745', class: 'success' },
            orange: { hex: '#fd7e14' },
            purple: { hex: '#6f42c1' },
            red: { hex: '#dc3545', class: 'danger' },
            yellow: { hex: '#ffc107', class: 'warning' }
        },
        cup: {
            groupClubCount: 4,
            groupQualifiedClubCount: 2
        },
        continentalCup: {
            maxClubCount: 32,
        },
        files: {
            defaultPlayerPhoto: `${ResourcesFolder}/players/0.svg`,
        },
        folders: {
            flagsFolder: `${ResourcesFolder}/countries`,
            kitsFolder: `${ResourcesFolder}/kits`,
            logosFolder: `${ResourcesFolder}/clubs`,
            photosFolder: `${ResourcesFolder}/players`,
        },
        matchSpeed: {
            normal: 1000,
            fast: 500,
            veryFast: 250
        },
        nationalCup: {
            maxClubCount: 64,
        },
        nationalLeague: {
            maxClubCount: 18,
            minClubCount: 8,
            maxDivisionCount: 4,
            promotionAndRelegationPercentage: 0.2,
        },
        pageSize: 50,
        player: {
            minAge: 15,
            maxAge: 45,
            minOverall: 1,
            maxOverall: 99,
        },
        playingStyles: ['defensive', 'balanced', 'offensive'],
        yellowCardsRequiredForSuspension: 3
    }
})();