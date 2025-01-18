class SimulationSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        this.isGoal = false;
        this.lastEventClubHome = null;
        this.lastEventClubAway = null;
    }

    getBallLocation() {
        return this._getBallDestination();
    }

    getCurrentChampionshipName() {
        const championship = this.currentMatch.championshipEdition.championship;
        const name = this.translator.getChampionshipName(championship);
        return name;
    }

    getCurrentEvent() {
        const events =  this.currentMatch.matchSimulation?.currentAction.matchSimulationEvents ?? [];
        return events.length > 0 ? events.last() : null;
    }

    getCurrentMatches(championshipEdition) {
        const matches = this.game.currentSeason.getCurrentMatchesByChampionshipEdition(championshipEdition);
        return matches;
    }

    getCurrentStageMessage(championshipEdition) {
        let message = '';
        const stage = this.game.currentSeason.getChampionshipEditionCurrentStage(championshipEdition);

        if (stage instanceof ChampionshipEditionFixture) {
            message = '{0} {1} - {2} {3}'.format(
                this.translator.get('Division'),
                championshipEdition.championship.division,
                this.translator.get('Matchday'),
                stage.number);
        }
        else if (stage instanceof ChampionshipEditionEliminationPhase) {
            message = this.translator.get(stage.name);
        }

        return message;
    }

    getCurrentChampionshipEditions() {
        const countryId = this.game.club?.country.id;
        const clubConfederation = this.game.confederations.find(conf => conf.countries.map(c => c.id).includes(countryId));
        let championshipEditions = this.game.currentSeason.getCurrentChampionshipEditions();

        let confederation = null;
        if (championshipEditions.flatMap(ce => ce.championship).some(c => c.confederation.id === clubConfederation.id))
            confederation = clubConfederation;
        else
            confederation = championshipEditions.flatMap(ce => ce.championship.confederation).distinct().getRandom();

        championshipEditions = championshipEditions.filter(ce => ce.championship.confederation.id === confederation?.id);
        return championshipEditions;
    }

    getFieldPlayers(club) {
        return club.players.filter(p => p.isOnField)
    }

    getLastMatchSimulationEvent(club) {
        const event = this.currentMatch.matchSimulation?.getLastMatchSimulationEvent(club);
        return event;
    }

    getLineup() {
        const lineup = this.game.club.getLineup(this.currentMatch?.championshipEdition);
        return lineup;
    }

    updated() {
        if (!this.currentMatch?.matchSimulation)
            return;

        this._animateBallTrajectory();
        
        this.lastEventClubHome = this.getLastMatchSimulationEvent(this.currentMatch.clubHome);
        this.lastEventClubAway = this.getLastMatchSimulationEvent(this.currentMatch.clubAway);

        if (this.isGoal) {
            this.game.pause();
            setTimeout(() => this.game.resume(), 2000);
        }
    }

    _animateBallTrajectory() {
        const keyframes = this._getBallTrajectory();

        const options = {
            duration: this.game.config.matchSpeed * 0.8
        };

        const ball = document.querySelector(".ball-container");
        if (ball)
            ball.animate(keyframes, options);
    }

    _getBallOrigin() {
        const location = this._getBallLocation(this.currentMatch.matchSimulation.previousBallPossessor);
        return location;
    }

    _getBallDestination() {
        const location = this._getBallLocation(this.currentMatch.matchSimulation.ballPossessor);
        return location;
    }

    _getBallLocation(player) {
        const point = { column: player.fieldLocalization.column, line: player.fieldLocalization.line };
        if (player.club.id === this.currentMatch.clubAway.id)
            reverse(point);

        this.isGoal = this.getCurrentEvent()?.type === 'goal';
        if (this.isGoal)
            point.line = point.line + (player.club.id === this.currentMatch.clubAway.id ? 0.5 : -0.5);

        const location = { top: `${point.column * 20}%`, left: `${point.line * 9.09}%` };
        return location;

        function reverse(point) {
            point.line = 10 - point.line;
            point.column = 4 - point.column;
        }
    }

    _getBallTrajectory() {
        const origin = this._getBallOrigin();
        const destination = this._getBallDestination();
        const trajectory = [origin, destination];
        return trajectory;
    }
}