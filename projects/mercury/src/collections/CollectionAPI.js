import axios from 'axios';

import Config from "../common/services/Config/Config";
import {handleHttpError, extractJsonData} from "../common/utils/httpUtils";

const headers = {'Content-Type': 'application/json'};

class CollectionAPI {
    getCollections() {
        return axios.get(Config.get().urls.collections, {headers: {Accept: 'application/json'}})
            .catch(handleHttpError("Failure when retrieving a list of collections"))
            .then(extractJsonData);
    }

    addCollection(name, description, connectionString, location) {
        return axios.put(
            Config.get().urls.collections,
            JSON.stringify({name, description, connectionString, location}),
            {headers}
        ).catch(handleHttpError("Failure while saving a collection"));
    }

    updateCollection(iri, name, description, connectionString, location) {
        return axios.patch(
            Config.get().urls.collections,
            JSON.stringify({iri, name, description, location, connectionString}),
            {headers}
        ).catch(handleHttpError("Failure while updating a collection"));
    }

    deleteCollection(id) {
        return axios.delete(
            `${Config.get().urls.collections}?iri=${encodeURIComponent(id)}`,
            {headers}
        ).catch(handleHttpError("Failure while deleting collection"));
    }
}

export default new CollectionAPI();
