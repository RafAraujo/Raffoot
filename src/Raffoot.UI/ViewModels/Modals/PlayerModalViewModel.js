class PlayerModalViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        this.player = null;
        this.offer = null;
    }

    get offerDescription() {
        const error = this.errorMessage;
        if (error) {
            return error;
        }

        return this.offer ? this.translator.getNumberInWords(this.offer.formatInWords()) : '';
    }

    get offerIsValid() {
        return this.errorMessage === '';
    }

    get errorMessage() {
        if (isNaN(this.offer) || this.offer < 0 || Array.from((this.offerInput ?? '').toString()).some(x => x < '0' || x > '9')) {
            return this.translator.get('Invalid value');
        }
        else if (this.offer > this.game.club.money) {
            return this.translator.get('Value greater than the money available');
        }
        return '';
    }

    selectPlayer(event, player) {
        if (this.player === player) {
            this.unselectPlayer();
        }
        else {
            this.player = player;
            this._scroll(event);
        }

        this.offerInput = null;
    }

    unselectPlayer() {
        this.player = null;
        this.offerInput = null;
    }

    updateOffer(value) {
        this.offer = value * 1000;
    }

    _scroll(event) {
        const divHeight = 55;
        const elementRect = event.currentTarget.getBoundingClientRect();
        if (elementRect.y + elementRect.height > document.documentElement.clientHeight - divHeight) {
            scrollBy(0, divHeight * 2);
        }
    }
}