class MatchModalViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.modal = new bootstrap.Modal('#modal-match');
        this.selectedMatch = null;
        this.selectedTab = 'lineups';

        const lineupOptions = {
            showAutomaticSelection: false,
            showUnlistedPlayers: false,
        };
        this.lineup = new TeamLineupViewModel(game, translator, true, lineupOptions);

        this.statistics = new MatchStatisticsViewModel(game, translator);
    }

    changeMatchMode() {
        
    }

    hideModal() {
        this.game.resume();
        this.modal.hide();
    }

    modalIsShown() {
        return this.modal._isShown;
    }

    selectMatch(match) {
        this.selectedMatch = match;
    }

    selectTab(tab) {
        this.selectedTab = tab;
    }

    showModal(match, club, tab = null) {
        this.selectMatch(match);
        this.lineup.selectClub(club);
        this.selectTab(tab ?? this.selectedTab);

        this.game.pause();
        this.modal.show();
    }
}