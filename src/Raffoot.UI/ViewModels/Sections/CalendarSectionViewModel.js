class CalendarSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.selectedCountry = game.club.country;
        this.selectedClub = game.club;
    }

    getCalendar() {
        const items = [];
        for (const seasonDate of this.game.currentSeason.seasonDates) {
            const match = seasonDate.matches.find(m => m.clubs?.map(c => c.id).includes(this.selectedClub.id));

            if (match || seasonDate.isTransferWindow) {
                const item = {
                    date: seasonDate.date,
                    match: match,
                    isTransferWindow: seasonDate.isTransferWindow,
                };

                items.push(item);
            }
        }

        return items;
    }

    getClubs() {
        const clubs = this.game.clubs
            .filter(c => c.country.id === this.selectedCountry.id)
            .orderBy('name');

        return clubs;
    }

    getCountries() {
        const countries = this.game.clubs
            .flatMap(c => c.country)
            .distinct()
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');
            
        return countries;
    }

    reset() {
        this.selectedCountry = this.game.club.country;
        this.selectedClub = this.game.club;
    }

    selectClub(id) {
        this.selectedClub = id ? Club.getById(parseInt(id)) : null;
    }

    selectCountry(id) {
        this.selectedCountry = id ? Country.getById(parseInt(id)) : null;
    }
}