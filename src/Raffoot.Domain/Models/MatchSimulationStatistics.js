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
            'Passes': [clubHomeStats.passing, clubAwayStats.passing],
            'Accurate passes': [clubHomeStats.passingSuccessful, clubAwayStats.passingSuccessful],
            'Fouls': [clubHomeStats.fouls, clubAwayStats.fouls],
        };

        return stats;
    }

    _getClubStats(club) {
        const finishing = this.matchSimulation.getMatchSimulationActions('finishing', club, false).length;
        const ballPossession = (this.matchSimulation.matchSimulationActions.filter(a => a.player.club == club).length / this.matchSimulation.matchSimulationActions.length);
        const passing = this.matchSimulation.getMatchSimulationActions('passing', club, false).length;
        const passingSuccessful = this.matchSimulation.getMatchSimulationActions('passing', club, true).length;
        const fouls = this.matchSimulation.getMatchSimulationActions('foul', club).length;

        const stats = {
            finishing,
            ballPossession,
            passing,
            passingSuccessful,
            fouls
        };

        return stats;
    }
}