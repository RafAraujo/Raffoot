class LanguageModalViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    setLanguage(language) {
        this.game.config.language = language;
        this.translator.setLanguage(language);
    }
}