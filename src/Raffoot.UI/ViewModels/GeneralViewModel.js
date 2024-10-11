class GeneralViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.message = { text: translator.get('Processing...'), type: 'primary' };
    }

    clearMessage() {
        this.message = { text: '', type: 'primary' };
    }
}