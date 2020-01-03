import axios from 'axios';
import {extractJsonData, handleHttpError} from '../common';


const collectionsUrl = "collections/";
const headers = {'Content-Type': 'application/json'};

class CollectionAPI {
    getCollections() {
        return axios.get(collectionsUrl, {headers: {Accept: 'application/json'}})
            .catch(handleHttpError("Failure when retrieving a list of collections"))
            .then(extractJsonData);
    }

    addCollection(name, description, connectionString, location) {
        return axios.put(
            collectionsUrl,
            JSON.stringify({name, description, connectionString, location}),
            {headers}
        ).catch(handleHttpError("Failure while saving a collection"));
    }

    updateCollection(iri, name, description, connectionString, location) {
        return axios.patch(
            collectionsUrl,
            JSON.stringify({iri, name, description, location, connectionString}),
            {headers}
        ).catch(handleHttpError("Failure while updating a collection"));
    }

    deleteCollection(id) {
        return axios.delete(
            `${collectionsUrl}?iri=${encodeURIComponent(id)}`,
            {headers}
        ).catch(handleHttpError("Failure while deleting collection"));
    }
}

export default new CollectionAPI();
