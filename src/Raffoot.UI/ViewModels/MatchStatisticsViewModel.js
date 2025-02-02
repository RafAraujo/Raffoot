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

        stats = Object.entries(stats).map(([key, value]) => ({
            name: this.translator.get(key),
            values: key === 'Ball possession' ? value.map(v => v.formatPercentage()) : value
        }));

        return stats;
    }
}