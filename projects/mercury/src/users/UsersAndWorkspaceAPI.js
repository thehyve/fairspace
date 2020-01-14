import axios from 'axios';

import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {currentProject} from "../projects/projects";

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getUser = () => axios.get((currentProject() && 'users/current/') || '/api/v1/account')
    .catch(handleHttpError("Failure when retrieving user's information"))
    .then(extractJsonData);

export const getUsers = () => axios.get('users/', requestOptions)
    .catch(handleHttpError('Error while loading users'))
    .then(extractJsonData);

export const getVersion = () => axios.get('/config/version.json', requestOptions)
    .catch(handleHttpError('Error while loading version information'))
    .then(extractJsonData);
