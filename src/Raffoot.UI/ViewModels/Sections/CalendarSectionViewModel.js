class CalendarSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }
    
    getClubCalendar() {
        const calendar = this._getCalendar(this.game.club);
        return calendar;
    }

    _getCalendar(club) {
        const items = [];
        for (const seasonDate of this.game.currentSeason.seasonDates) {
            const match = seasonDate.matches.find(m => m.clubs?.map(c => c.id).includes(club.id)) ?? null;

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
}