class SimulationSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getBallTrajectory() {
        const previous = this.currentMatch.matchSimulation.previousBallPossessor;
        const current = this.currentMatch.matchSimulation.ballPossessor;
        const isClubAway = this.currentMatch.matchSimulation.ballPossessor.club.id === this.currentMatch.clubAway.id;
        const isSuccessful = this.currentMatch.matchSimulation.currentAction.isSuccessful;

        const origin = { column: previous.fieldLocalization.column, line: previous.fieldLocalization.line };
        const destination = { column: current.fieldLocalization.column, line: current.fieldLocalization.line };

        if (isClubAway) {
            destination.line = 11 - destination.line;
            destination.column = 4 - destination.column;
        }

        if ((isClubAway && isSuccessful) || (!isClubAway && !isSuccessful)) {
            origin.line = 11 - origin.line;
            origin.column = 4 - origin.column;
        }

        const trajectory = [
            { top: `${origin.column * 60 + 25}px`, left: `${origin.line * 45}px` },
            { top: `${destination.column * 60 + 25}px`, left: `${destination.line * 45}px` },
        ];

        return trajectory;
    }

    getBallLocation() {
        const trajectory = this.getBallTrajectory();
        return trajectory[1];
    }

    getCurrentChampionshipName() {
        const championship = this.currentMatch.championshipEdition.championship;
        const name = this.translator.getChampionshipName(championship);
        return name;
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
        if (championshipEditions.flatMap(ce => ce.championship).some(c => c.confederation.id === clubConfederation.id)) {
            confederation = clubConfederation;
        }
        else {
            confederation = championshipEditions.flatMap(ce => ce.championship.confederation).distinct().getRandom();
        }

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

        const keyframes = this.getBallTrajectory();

        const options = {
            duration: this.game.config.matchSpeed - 500,
            iterations: 1,
        };

        const ball = document.querySelector("#ball");
        if (ball)
            ball.animate(keyframes, options);
    }
}