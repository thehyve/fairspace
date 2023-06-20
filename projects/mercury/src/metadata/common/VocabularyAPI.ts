import LinkedDataAPI from "./LinkedDataAPI";

export class LinkedDataVocabularyAPI extends LinkedDataAPI {
    constructor() {
        super('vocabulary');
    }
}

export default new LinkedDataVocabularyAPI();
