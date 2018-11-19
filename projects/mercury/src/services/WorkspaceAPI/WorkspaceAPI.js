import Config from "../Config/Config";
import {failOnHttpError} from "../../utils/httputils";

class WorkspaceAPI {
    static getConfig = {
        method: 'GET',
        headers: new Headers({'Accept': 'application/json'}),
        credentials: 'same-origin'
    };

    getUsers() {
        return fetch(Config.get().urls.users, WorkspaceAPI.getConfig)
            .then(failOnHttpError('Error while loading users'))
            .then(response => {
                return response.json()
            })
    }

    getWorkspace() {
        return fetch(Config.get().urls.workspace, WorkspaceAPI.getConfig)
            .then(failOnHttpError('Error while loading workspace details'))
            .then(response => {
                return response.json()
            })
    }
}

export default new WorkspaceAPI();
