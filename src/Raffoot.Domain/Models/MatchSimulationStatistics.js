class MatchSimulationStatistics {
    constructor(matchSimulationId) {
        this._matchSimulationId = matchSimulationId;
    }

    static create(matchSimulation) {
        const matchSimulationStatistics = new MatchSimulationStatistics(matchSimulation.id);
        matchSimulationStatistics.id = Context.game.matchSimulationStatistics.push(matchSimulationStatistics);
        return matchSimulationStatistics;
    }

    static getById(id) {
        return Context.game.matchSimulationStatistics[id - 1];
    }

    get matchSimulation() {
        return MatchSimulation.getById(this._matchSimulationId);
    }

    getStats() {
        const clubHomeStats = this._getClubStats(this.matchSimulation.match.clubHome);
        const clubAwayStats = this._getClubStats(this.matchSimulation.match.clubAway);

        const stats = {
            'Shots': [clubHomeStats.finishing, clubAwayStats.finishing],
            'Ball possession': [clubHomeStats.ballPossession, clubAwayStats.ballPossession],
            'Pass accuracy': [clubHomeStats.passAccuracy, clubAwayStats.passAccuracy],
            'Fouls': [clubHomeStats.fouls, clubAwayStats.fouls],
            'Yellow cards': [clubHomeStats.yellowCards, clubAwayStats.yellowCards],
            'Red cards': [clubHomeStats.redCards, clubAwayStats.redCards],
        };

        return stats;
    }

    _getClubStats(club) {
        const ms = this.matchSimulation;
        const actions = ms.matchSimulationActions;

        const finishing = ms.getMatchSimulationActions('finishing', club, false).length;
        const ballPossession = actions.filter(a => a.player.club == club).length / actions.length;
        const passing = ms.getMatchSimulationActions('passing', club, false).length;
        const passingSuccessful = ms.getMatchSimulationActions('passing', club, true).length;
        const passAccuracy = passingSuccessful / passing;
        const fouls = ms.getMatchSimulationActions('foul', club).length;
        const yellowCards = ms.getMatchSimulationEvents('yellow card', club).length;
        const redCards = ms.getMatchSimulationEvents('red card', club).length;

        const stats = {
            finishing,
            ballPossession,
            passing,
            passingSuccessful,
            passAccuracy,
            fouls,
            yellowCards,
            redCards,
        };

        return stats;
    }
}