import Config from '../../components/generic/Config/Config';
import {failOnHttpError} from "../../utils/httputils";
import {format} from 'util';

class PermissionStore {
    static getConfig = {
        method: 'GET',
        headers: new Headers({'Accept': 'application/json'}),
        credentials: 'same-origin'
    };

    /**
     * Retrieves a list of permissions for a specific collection.
     * @param collectionId The id of the collection.
     * @returns A Promise returning an array of user permissions, not including users with None permissions.
     */
    getCollectionPermissions(collectionId) {
        let url = format(Config.get().urls.collectionPermissions, collectionId);
        return fetch(url, PermissionStore.getConfig)
            .then(failOnHttpError('Error while loading collection permissions'))
            .then(response => response.json())
    }
}

export default new PermissionStore();
