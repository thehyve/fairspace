import axios from 'axios';

import {extractJsonData, handleHttpError} from "../utils/httpUtils";

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getUser = () => axios.get('/api/v1/account')
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData);

export const getUsers = () => axios.get('/api/keycloak/users/', requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData);

export const getVersion = () => axios.get('/config/version.json', requestOptions)
    .catch(handleHttpError('Error while loading version information'))
    .then(extractJsonData);
