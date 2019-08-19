import axios from 'axios';

import Config from "./Config/Config";
import {handleHttpError, extractJsonData} from "../utils/httpUtils";

const requestOptions = {
    headers: {Accept: 'application/json'}
};

class WorkspaceAPI {
    getUsers() {
        return axios.get(Config.get().urls.users, WorkspaceAPI.getConfig, requestOptions)
            .catch(handleHttpError('Error while loading users'))
            .then(extractJsonData);
    }

    getVersion() {
        return axios.get(Config.get().urls.version, WorkspaceAPI.getConfig, requestOptions)
            .catch(handleHttpError('Error while loading version information'))
            .then(extractJsonData);
    }
}

export default new WorkspaceAPI();
