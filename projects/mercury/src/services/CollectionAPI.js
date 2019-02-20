import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";

class CollectionAPI {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});

    static getHeaders = new Headers({Accept: 'application/json'});

    getCollections() {
        return fetch(Config.get().urls.collections, {
            method: 'GET',
            headers: CollectionAPI.getHeaders,
            credentials: 'same-origin'
        })
            .then(failOnHttpError("Failure when retrieving a list of collections"))
            .then(response => response.json());
    }

    addCollection(name, description, type, location) {
        return fetch(Config.get().urls.collections, {
            method: 'POST',
            headers: CollectionAPI.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({name, description, type, location})
        }).then(failOnHttpError("Failure while saving a collection"));
    }

    updateCollection(iri, name, description, location) {
        return fetch(`${Config.get().urls.collections}`, {
            method: 'PATCH',
            headers: CollectionAPI.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({iri, name, description, location})
        }).then(failOnHttpError("Failure while updating a collection"));
    }

    deleteCollection(id) {
        return fetch(`${Config.get().urls.collections}?iri=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: CollectionAPI.changeHeaders,
            credentials: 'same-origin'
        }).then(failOnHttpError("Failure while deleting collection"));
    }
}

export default new CollectionAPI();
