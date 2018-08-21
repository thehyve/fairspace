import Config from "../../components/generic/Config/Config";

function failOnHttpError(response, message) {
    if(!response.ok) {
        throw Error(message, response.error);
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
        return fetch(Config.get().urls.vocabulary, {
            method: 'GET',
            headers: MetadataStore.getHeaders,
            credentials: 'same-origin'
        }).then(response => {
            failOnHttpError(response, "Failure when retrieving vocabulary");
            return response.json();
        });
    }

}

export default new MetadataStore();