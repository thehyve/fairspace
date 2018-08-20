import Config from "../../components/generic/Config/Config";

function failOnHttpError(response, message) {
    if(!response.ok) {
        throw Error(message, response.error);
    }
}

class CollectionStore {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});
    static getHeaders = new Headers({'Accept': 'application/json'});

    getCollections() {
        return fetch(Config.get().urls.collections, {
            method: 'GET',
            headers: CollectionStore.getHeaders,
            credentials: 'same-origin'
        }).then(response => {
            failOnHttpError(response, "Failure when retrieving list of collections");
            return response.json();
        })
    }

    getCollection(id) {
        return fetch(Config.get().urls.collections + "/" + id, {
            method: 'GET',
            headers: CollectionStore.getHeaders,
            credentials: 'same-origin'
        }).then(response => {
            failOnHttpError(response, "Failure when retrieving list of collections");
            return response.json();
        })
    }

    addCollection(name, description) {
        return fetch(Config.get().urls.collections, {
            method: 'POST',
            headers: CollectionStore.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({ name: name, description: description })
        }).then(response => {
            failOnHttpError(response, "Failure while saving collection");
            return response;
        })
    }

    updateCollection(id, name, description) {
        return fetch(Config.get().urls.collections + '/' + id, {
            method: 'PATCH',
            headers: CollectionStore.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({ name: name, description: description })
        }).then(response => {
            failOnHttpError(response, "Failure while updating collection");
            return response;
        })
    }

}

export default new CollectionStore();