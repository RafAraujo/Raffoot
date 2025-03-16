class MatchStatisticsViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getStatistics(match) {
        if (!match?.matchSimulation)
            return [];

        match.matchSimulation.generateStatistics();

        let stats = match.matchSimulation.matchSimulationStatistics.getStats();

        const statsToFormatAsPercengage = ['Ball possession', 'Pass accuracy']

        stats = Object.entries(stats).map(([key, value]) => ({
            key: key,
            name: this.translator.get(key),
            values: value,
        }));

        for (const stat of stats) {
            for (let i = 0; i < 2; i++) {
                if (isNaN(stat.values[i]))
                    stat.values[i] = '-';
                else if (statsToFormatAsPercengage.includes(stat.key))
                    stat.values[i] = stat.values[i].formatPercentage();
            }
        }

        return stats;
    }
}