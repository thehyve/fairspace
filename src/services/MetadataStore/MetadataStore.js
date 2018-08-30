import Config from "../../components/generic/Config/Config";
import vocabulary from './vocabulary'
import ErrorDialog from "../../components/error/ErrorDialog";

function failOnHttpError(response, message) {
    if(!response.ok) {
        ErrorDialog.showError(response.error, message);
    }
}

class MetadataStore {
    static changeHeaders = new Headers({'Content-Type': 'application/ld+json'});
    static getHeaders = new Headers({'Accept': 'application/ld+json'});

    get(subject) {
        return fetch(Config.get().urls.metadata + encodeURI(subject), {
            method: 'GET',
            headers: MetadataStore.getHeaders,
            credentials: 'same-origin'
        }).then(response => {
            failOnHttpError(response, "Failure when retrieving metadata");
            return response.json();
        });
    }

    getVocabulary() {
        return Promise.resolve(vocabulary)
    }

}

export default new MetadataStore();
