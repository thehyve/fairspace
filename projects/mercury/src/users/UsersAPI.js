import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {currentWorkspace} from "../workspaces/workspaces";
import {createMetadataIri} from '../common/utils/linkeddata/metadataUtils';

export type User = {
    iri: string;
    name: string;
    email?: string;
    admin: boolean,
    roles: string[]
}

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getWorkspaceUser = () => axios.get(`/api/v1/workspaces/${currentWorkspace()}/users/current/`)
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData);

export const getUser = () => axios.get('/api/v1/account')
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData)
    .then(keycloakUser => ({
        iri: createMetadataIri(keycloakUser.id),
        name: keycloakUser.fullName || keycloakUser.username,
        email: keycloakUser.email,
        admin: keycloakUser.authorizations.includes('organisation-admin'),
        roles: []
    }));

export const getUsers = () => axios.get('users/', requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData);

export const addUser = (user) => axios.put('users/', JSON.stringify(user), requestOptions)
    .catch(handleHttpError('Error while adding a user'))
    .then(extractJsonData);
