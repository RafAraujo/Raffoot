class TranslatorService {
    constructor() {
        this.language = MultiLanguage[TranslatorService.getLanguage()]
    }

    get(text) {
        let translation = this.language[text];
        if (translation) {
            return translation;
        }
        else {
            throw new Error(`Text "${text}" not found`);
        }
    }

    getChampionshipName(championship) {       
        const championshipNameWithoutDivision = championship.name.replace(` ${championship.division}`, '');
        const translation = this.get(championshipNameWithoutDivision);
        return championship.division ? `${translation} ${championship.division}` : `${translation}`;
    }

    static getLanguage() {
        let availableLanguages = Object.getOwnPropertyNames(MultiLanguage);
        let browserLanguage = navigator.language || navigator.userLanguage;
        let language = availableLanguages.find(l => l === browserLanguage || browserLanguage.startsWith(l)) ?? "en";
        return language;
    }
}