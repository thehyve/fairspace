import queryString from 'query-string';
import axios from 'axios';
import {handleHttpError, extractJsonData} from '@fairspace/shared-frontend';

import Config from '../common/services/Config';

class PermissionAPI {
    /**
     * Retrieves a list of permissions for a specific collection.
     * @param iri The id of the resource.
     * @returns A Promise returning an array of user permissions, not including users with None permissions.
     */
    getPermissions(iri) {
        return axios.get(
            `${Config.get().urls.permissions}?${queryString.stringify({iri, all: true})}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        ).catch(handleHttpError('Error while loading collection permissions'))
            .then(extractJsonData);
    }

    alterPermission(userIri, iri, access) {
        if (!userIri || !iri || !access) {
            return Promise.reject(Error("No userIri, IRI or access given"));
        }

        const payload = {user: userIri, access};

        return axios.put(
            `${Config.get().urls.permissions}?${queryString.stringify({iri})}`,
            JSON.stringify(payload),
            {headers: {'Content-Type': 'application/json'}}
        ).catch(handleHttpError("Failure while altering a collection's permission"))
            .then(extractJsonData);
    }
}

export default new PermissionAPI();
