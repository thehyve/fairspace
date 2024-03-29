import LinkedDataAPI from './LinkedDataAPI';

export class LinkedDataVocabularyAPI extends LinkedDataAPI {
    constructor(remoteURLPrefix = '/api') {
        super('vocabulary', remoteURLPrefix);
    }
}

export default new LinkedDataVocabularyAPI();
