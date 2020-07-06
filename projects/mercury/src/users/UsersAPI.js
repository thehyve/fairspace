import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {createMetadataIri} from '../metadata/common/metadataUtils';

export type User = {
    iri: string;
    id: string;
    name: string;
    email?: string;
    access: string;
}

export type UserRoles = {
    admin: boolean;
    viewPublicMetadata: boolean;
}

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getUser = (): User & UserRoles => axios.get('/api/v1/users/current')
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData)
    .then(user => ({...user, iri: createMetadataIri(user.id)}));

export const logoutUser = () => axios.post('/api/v1/users/current/logout', {}, {headers: {'Content-Type': 'application/json'}})
    .catch(handleHttpError("Failure when logging out user"));

export const getUsers = (): Array<User> => axios.get('/api/v1/users/', requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData)
    .then(users => users.map(user => ({iri: createMetadataIri(user.id), ...user})));
