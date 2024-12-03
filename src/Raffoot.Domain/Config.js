const Config = (function () {
    const ResourcesFolder = 'res';

    const PlayigStyleOptions = {
        defensive: 1,
        balanced: 2,
        offensive: 3,
    };
    
    return {
        browserLanguage: navigator.language ?? navigator.userLanguage,
        colors: {
            black: { hex: '#212529', class: 'dark' },
            blue: { hex: '#007bff', class: 'primary' },
            gold: { hex: '#ffd700' },
            gray: { hex: '#6c757d', class: 'secondary' },
            green: { hex: '#28a745', class: 'success' },
            orange: { hex: '#fd7e14' },
            purple: { hex: '#6f42c1' },
            red: { hex: '#dc3545', class: 'danger' },
            white: { hex: '#f8f9fa', class: 'light' },
            yellow: { hex: '#ffc107', class: 'warning' },
        },
        cup: {
            groupClubCount: 4,
            groupQualifiedClubCount: 2
        },
        continentalCup: {
            maxClubCount: 32,
        },
        dataSources: ['Fifa', 'FM'],
        delayBeforeSummary: 1000,
        files: {
            defaultPlayerPhoto: `${ResourcesFolder}/image/data sources/Fifa/players/0.svg`,
        },
        indexedDbName: 'Raffoot',
        mockScript: '../../Raffoot.Infrastructure/Raffoot.Data/Mock.js',
        matchSpeedOptions: {
            normal: 1000,
            fast: 500,
            veryFast: 250,
            ultraFast: 125,
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
        search: {
            pageSize: 50,
        },
        player: {
            conditions: [-2, -1, 0, 1, 2],
            minAge: 15,
            maxAge: 45,
            minOverall: 1,
            maxOverall: 99,
        },
        resourcesFolder: 'res',
        theme: localStorage.getItem('theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
        version: '1.0',
        years: {
            default: new Date().getFullYear(),
            min: 2003,
            max: new Date().getFullYear() + 1,
        },
        yellowCardsRequiredForSuspension: 3,
    }
})();