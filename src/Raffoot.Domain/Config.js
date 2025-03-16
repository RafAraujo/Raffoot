const Config = (function () {
    const ResourcesFolder = 'res';

    const PlayingStyleOptions = {
        'Defensive': 1,
        'Balanced': 2,
        'Offensive': 3,
    };

    const createColor = (hex, cssClass = '') => ({ hex, class: cssClass });
    const getLanguage = () => navigator.language ?? navigator.userLanguage;
    const getTheme = () => localStorage.getItem('theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    return {
        browserLanguage: getLanguage(),
        colors: {
            black: createColor('#212529', 'dark'),
            blue: createColor('#007bff', 'primary'),
            gold: createColor('#ffd700'),
            gray: createColor('#6c757d', 'secondary'),
            green: createColor('#28a745', 'success'),
            orange: createColor('#fd7e14'),
            purple: createColor('#6f42c1'),
            red: createColor('#dc3545', 'danger'),
            white: createColor('#f8f9fa', 'light'),
            yellow: createColor('#ffc107', 'warning'),
        },
        championship: {
            cup: {
                group: {
                    clubCount: 4,
                    qualifiedClubCount: 2,
                },
                national: {
                    maxClubCount: 64,
                }
            },
            league: {
                national: {
                    maxClubCount: 18,
                    minClubCount: 8,
                    promotionAndRelegationPercentage: 0.2,
                },
            },
            yellowCardsRequiredForSuspension: 3,
        },
        dataSources: ['Fifa', 'FM'],
        delayBeforeSummary: 1500,
        files: {
            defaultPlayerPhoto: `${ResourcesFolder}/image/data sources/Fifa/players/0.svg`,
            mockScript: `${ResourcesFolder}/../../Raffoot.Infrastructure/Raffoot.Data/Mock.js`,
        },
        indexedDbName: 'Raffoot',
        match: {
            maxBenchSize: 12,
            maxPlayerSubstitutions: 5,
            modes: ['start', 'simulate'],
            speedOptions: {
                'Super slow': 900,
                'Very slow': 800,
                'Slow': 700,
                'Normal': 600,
                'Fast': 500,
                'Very fast': 400,
                'Super fast': 300,
            },
        },
        search: {
            pageSize: 50,
        },
        player: {
            conditions: {
                'Very bad': -2,
                'Bad': -1,
                'Normal': 0,
                'Good': 1,
                'Very good': 2,
            },
            age: {
                min: 15,
                max: 45,
            },
            overall: {
                min: 1,
                max: 99,
            }
        },
        resourcesFolder: ResourcesFolder,
        theme: getTheme(),
        version: '1.0',
        years: {
            default: new Date().getFullYear(),
            min: 2003,
            max: new Date().getFullYear() + 1,
        },
    };
})();