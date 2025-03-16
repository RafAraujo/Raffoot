class PlayerModalViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        this.player = null;
        this.offerInput = null;
        this.offer = null;
    }

    getErrorMessage() {
        if (!this.offer || isNaN(this.offer) || this.offer < 0) {
            return this.translator.get('Invalid value');
        }
        else if (this.offer > this.game.club.money) {
            return this.translator.get('Value greater than the money available');
        }
        return '';
    }

    getOfferDescription() {
        if (!this.offer)
            return '';

        const error = this.getErrorMessage();
        if (error) {
            return error;
        }

        const description = this.translator.getNumberInWords(this.offer.formatInWords());
        return description;
    }

    offerIsValid() {
        return this.getErrorMessage() === '';
    }

    loadDefaultPlayerPhoto(event) {
        Common.loadDefaultPlayerPhoto(event);
    }

    selectPlayer(player) {
        this.unselectPlayer();
        this.player = player;
    }

    unselectPlayer() {
        this.player = null;
        this.offerInput = null;
        this.offer = null;
    }

    updateOffer(value) {
        this.offer = value * 1000;
    }
}