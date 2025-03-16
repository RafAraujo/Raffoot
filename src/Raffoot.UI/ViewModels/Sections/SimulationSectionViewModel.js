class SimulationSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        this.isGoal = false;
        this.currentEvent = null;
        this.lastEventClubHome = null;
        this.lastEventClubAway = null;

        this.selectedMatch = null;

        this.__watch = {
            currentMatch: this.watchCurrentMatch
        };
    }

    __beforeUpdate() {
        if (!this.currentMatch?.matchSimulation)
            return;

        if (!this.game.isPaused && this.game.time > 0)
            this._animateBallTrajectory();

        this.lastEventClubHome = this.getLastMatchSimulationEvent(this.currentMatch.clubHome);
        this.lastEventClubAway = this.getLastMatchSimulationEvent(this.currentMatch.clubAway);

        if (this.isGoal) {
            this.game.pause();
            setTimeout(() => {
                if (!Router.get('modal-match').modalIsShown())
                    this.game.resume()
            }, 1000);
        }
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
        const events = this.currentMatch.matchSimulation?.currentAction?.matchSimulationEvents ?? [];
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

    getPlayersButtons() {
        const currentMatch = this.currentMatch;

        if (!currentMatch)
            return [];

        const ballPossessor = currentMatch.matchSimulation?.ballPossessor;

        const linePercentage = this._getFieldLocalizationLLinePercentage();
        const columnPercentage = this._getFieldLocalizationColumnPercentage();

        const colorsAreSimilar = ColorHelper.areSimilar(currentMatch.clubs[0].colors.backgroundCustom, currentMatch.clubs[1].colors.backgroundCustom);

        const players = currentMatch.clubs.flatMap(c => c.players).filter(p => p.isOnField);

        const items = players.map(p => ({
            player: p,
            html: {
                playerButtonContainer: {
                    class: p.club.id === currentMatch.clubHome.id ? ['justify-content-start'] : ['justify-content-end'],
                    style: {
                        top: (p.club.id === currentMatch.clubHome.id ? p.fieldLocalization.column : 4 - p.fieldLocalization.column) * columnPercentage + '%',
                        left: (p.club.id === currentMatch.clubHome.id ? p.fieldLocalization.line : 10 - p.fieldLocalization.line) * linePercentage + '%',
                        zIndex: p.club.id === ballPossessor?.club.id ? 2 : 1,
                        opacity: p.club.id === ballPossessor?.club.id ? 1 : 0.5,
                    },
                },
                playerButton: {
                    class: p.club.id === currentMatch.clubHome.id ? ['player-button-home'] : ['player-button-away'],
                    style: {
                        backgroundColor: colorsAreSimilar && p.club.id === currentMatch.clubAway.id ? currentMatch.clubHome.colors.foregroundCustom : p.club.colors.backgroundCustom,
                        color: colorsAreSimilar && p.club.id === currentMatch.clubAway.id ? currentMatch.clubHome.colors.backgroundCustom : p.club.colors.foregroundCustom,
                    },
                },
            },
        }));

        return items;
    }

    getLastMatchSimulationEvent(club) {
        const event = this.currentMatch.matchSimulation?.getLastMatchSimulationEvent(club);
        return event;
    }

    selectMatch(match) {
        this.selectedMatch = match;
    }

    showModal(match, club) {
        if (this.game.time >= 90)
            return;

        Router.get('modal-match').showModal(match, club);
    }

    watchCurrentMatch(newValue) {
        this.selectedMatch = newValue;
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

        this.currentEvent = this.getCurrentEvent();
        this.isGoal = this.currentEvent?.type === 'goal';
        if (this.isGoal)
            point.line = point.line + (player.club.id === this.currentMatch.clubAway.id ? 0.5 : -0.5);

        const linePercentage = this._getFieldLocalizationLLinePercentage();
        const columnPercentage = this._getFieldLocalizationColumnPercentage();

        const location = { top: `${point.column * columnPercentage}%`, left: `${point.line * linePercentage}%` };
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

    _getFieldLocalizationLLinePercentage() {
        const fieldLocalizations = FieldLocalization.all();
        const maxLine = fieldLocalizations.map(fl => fl.line).max()
        const linePercentage = 100 / (maxLine + 2);
        return linePercentage;
    }

    _getFieldLocalizationColumnPercentage() {
        const fieldLocalizations = FieldLocalization.all();
        const maxColumn = fieldLocalizations.map(fl => fl.column).max();
        const columnPercentage = 100 / (maxColumn + 1);
        return columnPercentage;
    }
}