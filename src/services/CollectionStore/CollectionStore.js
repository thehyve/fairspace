import Config from "../../components/generic/Config/Config";
import {failOnHttpError} from "../../utils/httputils";

class CollectionStore {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});
    static getHeaders = new Headers({'Accept': 'application/json'});

    getCollections() {
        return fetch(Config.get().urls.collections, {
            method: 'GET',
            headers: CollectionStore.getHeaders,
            credentials: 'same-origin'
        })
            .then(failOnHttpError("Failure when retrieving a list of collections"))
            .then(response => response.json())
            .then(collections => collections.map(this._ensureCollectionMetadata))
    }

    getCollection(id) {
        return fetch(Config.get().urls.collections + "/" + id, {
            method: 'GET',
            headers: CollectionStore.getHeaders,
            credentials: 'same-origin'
        })
            .then(failOnHttpError("Failure when retrieving a collection"))
            .then(response => response.json())
            .then(this._ensureCollectionMetadata)
    }

    addCollection(name, description) {
        return fetch(Config.get().urls.collections, {
            method: 'POST',
            headers: CollectionStore.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({ metadata: {name: name, description: description} })
        }).then(failOnHttpError("Failure while saving a collection"))
    }

    updateCollection(id, name, description) {
        return fetch(Config.get().urls.collections + '/' + id, {
            method: 'PATCH',
            headers: CollectionStore.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({ metadata: {name: name, description: description} })
        }).then(failOnHttpError("Failure while updating a collection"))
    }

    deleteCollection(id) {
        return fetch(Config.get().urls.collections + '/' + id, {
            method: 'DELETE',
            headers: CollectionStore.changeHeaders,
            credentials: 'same-origin'
        }).then(failOnHttpError("Failure while deleting collection"))
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
