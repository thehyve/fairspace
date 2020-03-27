import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {createMetadataIri} from '../common/utils/linkeddata/metadataUtils';

export type User = {
    iri: string;
    id: string;
    fullName: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    admin: boolean;
}

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getUser = () => axios.get('/api/v1/users/current')
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData)
    .then(user => ({...user, iri: createMetadataIri(user.id)}));

export const getUsers = () => axios.get('/api/v1/users/', requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData)
    .then(users => users.map(user => ({iri: createMetadataIri(user.id), ...user})));
