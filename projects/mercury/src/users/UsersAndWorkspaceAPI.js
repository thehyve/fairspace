import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {currentProject} from "../projects/projects";

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

export const getUser = () => {
    if (currentProject()) {
        return axios.get('users/current/')
            .catch(handleHttpError("Failure when retrieving user's information"))
            .then(extractJsonData);
    }

    return axios.get('/api/v1/account')
        .catch(handleHttpError("Failure when retrieving user's information"))
        .then(extractJsonData)
        .then(keycloakUser => ({
            name: keycloakUser.fullName,
            email: keycloakUser.email,
            admin: keycloakUser.authorizations.includes('organisation-admin'),
            roles: []
        }));
};

export const getUsers = () => axios.get('users/', requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData);

export const addUser = (user) => axios.put('users/', JSON.stringify(user), requestOptions)
    .catch(handleHttpError('Error while adding a user'))
    .then(extractJsonData);

export const getVersion = () => axios.get('/config/version.json', requestOptions)
    .catch(handleHttpError('Error while loading version information'))
    .then(extractJsonData);
