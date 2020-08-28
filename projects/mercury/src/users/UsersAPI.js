import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {createMetadataIri} from '../metadata/common/metadataUtils';

export type User = {
    iri: string;
    id: string;
    name: string;
    email?: string;
    access: string;
    isSuperadmin: boolean;
    isAdmin: boolean;
    canViewPublicMetadata: boolean;
    canViewPublicData: boolean;
    canAddSharedMetadata: boolean;
}

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getUser = (): User => axios.get('/api/v1/users/current')
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData)
    .then((user: User) => ({...user, iri: createMetadataIri(user.id)}));

export const logoutUser = () => axios.post('/api/v1/users/current/logout')
    .catch(handleHttpError("Failure when logging out user"));

export const getUsers = (): User[] => axios.get('/api/v1/users/', requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData)
    .then((users: User[]) => users.map(user => ({iri: createMetadataIri(user.id), ...user})));

export const setUserRole = (id: string, role, enable: boolean) => axios.patch('/api/v1/users/', {id, [role]: enable})
    .catch(handleHttpError('Error altering user\'s role'));
