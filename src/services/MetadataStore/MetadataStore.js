import Config from "../../components/generic/Config/Config";
import vocabulary from './vocabulary'
import {failOnHttpError} from "../../utils/httputils";



class MetadataStore {
    static changeHeaders = new Headers({'Content-Type': 'application/ld+json'});
    static getHeaders = new Headers({'Accept': 'application/ld+json'});

    get(subject) {
        return fetch(Config.get().urls.metadata + encodeURI(subject), {
            method: 'GET',
            headers: MetadataStore.getHeaders,
            credentials: 'same-origin'
        })
            .then(failOnHttpError("Failure when retrieving metadata"))
            .then(response => response.json());
    }

    getVocabulary() {
        return Promise.resolve(vocabulary)
    }

}

export default new MetadataStore();
