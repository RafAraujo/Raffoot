class PreferencesModalViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    changeMatchSpeed(value) {
        this.game.config.matchSpeed = value;
    }

    getMatchSpeedOptions() {
        const options = Object.entries(Config.match.speedOptions).map(([key, value]) => ({
            name: this.translator.get(key),
            value: value
        }));

        return options;
    }
}