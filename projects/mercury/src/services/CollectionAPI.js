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
            .then(response => response.json())
            .then(collections => {
                collections.forEach(c => {
                    c.id = c.location;
                });
                return collections;
            });
    }

    addCollection(name, description, type) {
        return fetch(Config.get().urls.collections, {
            method: 'POST',
            headers: CollectionAPI.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({name, description, type})
        }).then(failOnHttpError("Failure while saving a collection"));
    }

    updateCollection(id, name, description) {
        return fetch(`${Config.get().urls.collections}/${id}`, {
            method: 'PATCH',
            headers: CollectionAPI.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({name, description})
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
