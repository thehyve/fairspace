import queryString from 'query-string';
import Config from './Config/Config';
import failOnHttpError from "../utils/httpUtils";

class PermissionAPI {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});

    static getHeaders = new Headers({Accept: 'application/json'});

    /**
     * Retrieves a list of permissions for a specific collection.
     * @param collectionId The id of the collection.
     * @returns A Promise returning an array of user permissions, not including users with None permissions.
     */
    getPermissions(iri, useCache = true) {
        return fetch(`${Config.get().urls.permissions}?${queryString.stringify({iri, all: true})}`, {
            method: 'GET',
            header: PermissionAPI.getHeaders,
            credentials: 'same-origin',
            cache: useCache ? 'default' : 'reload'
        })
            .then(failOnHttpError('Error while loading collection permissions'))
            .then(response => response.json());
    }

    alterPermission(userId, iri, access) {
        if (!userId || !iri || !access) {
            return Promise.reject(Error("No userId, collectionId or access given"));
        }
        return fetch(`${Config.get().urls.permissions}?${queryString.stringify({iri})}`, {
            method: 'PUT',
            headers: PermissionAPI.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({user: userId, access})
        })
            .then(failOnHttpError("Failure while alter a collection's permission"))
            .then(response => response.json());
    }
}

export default new PermissionAPI();
