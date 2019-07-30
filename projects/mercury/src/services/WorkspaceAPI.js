import axios from 'axios';

import Config from "./Config/Config";
import {handleHttpError} from "../utils/httpUtils";

const requestOptions = {
    headers: {Accept: 'application/json'}
};

class WorkspaceAPI {
    getUsers() {
        return axios.get(Config.get().urls.users, WorkspaceAPI.getConfig, requestOptions)
            .catch(handleHttpError('Error while loading users'))
            .then(response => response.data);
    }

    getWorkspace() {
        return axios.get(Config.get().urls.workspace, WorkspaceAPI.getConfig, requestOptions)
            .catch(handleHttpError('Error while loading workspace details'))
            .then(response => response.data);
    }
}

export default new WorkspaceAPI();
