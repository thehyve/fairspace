import queryString from 'query-string';
import axios from 'axios';

import Config from './Config/Config';
import {handleHttpError} from "../utils/httpUtils";

class PermissionAPI {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});

    static getHeaders = new Headers({Accept: 'application/json'});

    /**
     * Retrieves a list of permissions for a specific collection.
     * @param iri The id of the resource.
     * @returns A Promise returning an array of user permissions, not including users with None permissions.
     */
    getPermissions(iri, useCache = true) {
        return axios(`${Config.get().urls.permissions}?${queryString.stringify({iri, all: true})}`, {
            method: 'GET',
            header: PermissionAPI.getHeaders,
            credentials: 'same-origin',
            cache: useCache ? 'default' : 'reload'
        })
            .catch(handleHttpError('Error while loading collection permissions'))
            .then(response => response.json());
    }

    alterPermission(userIri, iri, access) {
        if (!userIri || !iri || !access) {
            return Promise.reject(Error("No userIri, IRI or access given"));
        }
        const payload = {user: userIri, access};
        return axios(`${Config.get().urls.permissions}?${queryString.stringify({iri})}`, {
            method: 'PUT',
            headers: PermissionAPI.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        })
            .catch(handleHttpError("Failure while altering a collection's permission"))
            .then(res => res.json());
    }
}

export default new PermissionAPI();
