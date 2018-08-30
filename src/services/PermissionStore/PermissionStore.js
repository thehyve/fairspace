import Config from '../../components/generic/Config/Config';
import {failOnHttpError} from "../../utils/httputils";

class PermissionStore {
    static getHeaders = new Headers({'Accept': 'application/json'});

    getCollectionPermissions(collectionId, user) {
        return fetch(Config.get().urls.collections + '/' + collectionId + '/permissions' + (user ? '?user=' + user : ''),
            {
                method: 'GET',
                headers: PermissionStore.getHeaders,
                credentials: 'same-origin'
            })
            .then(failOnHttpError('Error while loading collection permissions'))
            .then(response => response.json())
    }
}

export default new PermissionStore();
