class CalendarSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }
    
    getClubCalendar() {
        const calendar = this.game.currentSeason.getCalendarByClub(this.game.club);
        return calendar;
    }
}