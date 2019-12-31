import axios from "axios";
import {extractJsonData, handleHttpError} from '../common';

import {createMetadataIri} from "../common/utils/linkeddata/metadataUtils";
import {SEARCH_DEFAULT_SIZE} from "../constants";

const userSearchUrl = '/api/keycloak/users?search=';

export default {
    /**
     * Searches keycloak  with the qiven query string on the specified types
     * @param query
     * @param types     List of class URIs to search for. If empty, it returns all types
     * @return Promise
     */
    searchUsers: ({query, size = SEARCH_DEFAULT_SIZE}) => axios
        .get(userSearchUrl + encodeURIComponent(query) + '&max=' + size)
        .catch(handleHttpError("Failure when retrieving users"))
        .then(extractJsonData)
        .then(users => users.map(user => ({...user, iri: createMetadataIri(user.id)})))
};
