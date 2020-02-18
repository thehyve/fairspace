import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {createMetadataIri} from '../common/utils/linkeddata/metadataUtils';
import {workspaceRole} from "../common/utils/userUtils";

export type User = {
    iri: string;
    id: string;
    fullName: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    authorizations: string
}

export type WorkspaceUser = User & { role?: string };


const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getUser = () => axios.get('/api/v1/account')
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData)
    .then(user => ({...user, iri: createMetadataIri(user.id)}));

export const getUsers = () => axios.get('users/', requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData)
    .then(users => users.map(user => ({iri: createMetadataIri(user.id), role: workspaceRole(user), ...user})));

export const grantUserRole = (user, role) => axios.put(`users/${user.id}/roles/${role}`, null, requestOptions)
    .catch(handleHttpError('Error while altering a role'));
