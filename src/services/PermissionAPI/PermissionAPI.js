import Config from '../../components/generic/Config/Config';
import {failOnHttpError} from "../../utils/httputils";
import {format} from 'util';

class PermissionAPI {

    static changeHeaders = new Headers({'Content-Type': 'application/json'});
    static getHeaders = new Headers({'Accept': 'application/json'});

    /**
     * Retrieves a list of permissions for a specific collection.
     * @param collectionId The id of the collection.
     * @returns A Promise returning an array of user permissions, not including users with None permissions.
     */
    getCollectionPermissions(collectionId) {
        let url = format(Config.get().urls.collectionPermissions, collectionId);
        return fetch(url, {
            method: 'GET',
            header: PermissionAPI.getHeaders,
            credentials: 'same-origin'
        })
            .then(failOnHttpError('Error while loading collection permissions'))
            .then(response => response.json());
    }

    alterCollectionPermission(userId, collectionId, access) {
        return fetch(Config.get().urls.collections, {
            method: 'PUT',
            headers: PermissionAPI.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({subject: userId, collection: collectionId,  access: access})
        }).then(failOnHttpError("Failure while alter a collection's permission"))
    }

    removeUserFromCollectionPermission(userId, collectionId) {
        this.alterCollectionPermission(userId, collectionId, 'None');
    }
}

export default new PermissionAPI();
