import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {createMetadataIri} from '../common/utils/linkeddata/metadataUtils';

export type User = {
    iri: string;
    id: string;
    name: string;
    email?: string;
    admin: boolean;
    access: string;
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
