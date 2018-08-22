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
        }).then(collections => collections.map(this._ensureCollectionMetadata))
    }

    getCollection(id) {
        return fetch(Config.get().urls.collections + "/" + id, {
            method: 'GET',
            headers: CollectionStore.getHeaders,
            credentials: 'same-origin'
        }).then(response => {
            failOnHttpError(response, "Failure when retrieving list of collections");
            return response.json();
        }).then(this._ensureCollectionMetadata)
    }

    addCollection(name, description) {
        return fetch(Config.get().urls.collections, {
            method: 'POST',
            headers: CollectionStore.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({ metadata: {name: name, description: description} })
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
            body: JSON.stringify({ metadata: {name: name, description: description} })
        }).then(response => {
            failOnHttpError(response, "Failure while updating collection");
            return response;
        })
    }

    deleteCollection(id) {
        return fetch(Config.get().urls.collections + '/' + id, {
            method: 'DELETE',
            headers: CollectionStore.changeHeaders,
            credentials: 'same-origin'
        }).then(response => {
            failOnHttpError(response, "Failure while deleting collection");
            return response;
        })
    }

    _ensureCollectionMetadata(collection) {
        // Ensure proper structure of collections, e.g. that metadata is present
        if(!collection.metadata) {
            collection.metadata = { name: '[anonymous collection]' }
        }
        return collection;
    }

}

export default new CollectionStore();