import axios from 'axios';

import {extractJsonData, handleHttpError} from "../utils/httpUtils";

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getUser = (url) => axios.get(url)
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData);

export const getUsers = (url) => axios.get(url, requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData);

export const getVersion = (url) => axios.get(url, requestOptions)
    .catch(handleHttpError('Error while loading version information'))
    .then(extractJsonData);
