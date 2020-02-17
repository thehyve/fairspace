import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {currentWorkspace} from "../workspaces/workspaces";
import {createMetadataIri} from '../common/utils/linkeddata/metadataUtils';

export type User = {
    iri: string;
    id: string;
    name: string;
    email?: string;
    admin: boolean,
    role?: string
}

const requestOptions = {
    headers: {Accept: 'application/json'}
};

const workspaceRole = (roles) => {
    if (roles.includes(`workspace-${currentWorkspace()}-coordinator`)) {
        return 'coordinator';
    }
    if (roles.includes(`workspace-${currentWorkspace()}-datasteward`)) {
        return 'datasteward';
    }
    if (roles.includes(`workspace-${currentWorkspace()}-write`)) {
        return 'write';
    }
    if (roles.includes(`workspace-${currentWorkspace()}-user`)) {
        return 'user';
    }
    return undefined;
};

export const getWorkspaceUser = () => axios.get(`/api/v1/account`)
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData)
    .then(user => ({...user, role: workspaceRole(user.authorizations), admin: user.authorizations.includes('organisation-admin')}));

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
    .then(extractJsonData)
    .then(users => users.map(user => ({iri: createMetadataIri(user.id), ...user})));

export const grantUserRole = (user, role) => axios.put(`users/${user.id}/roles/${role}`, null, requestOptions)
    .catch(handleHttpError('Error while altering a role'));
