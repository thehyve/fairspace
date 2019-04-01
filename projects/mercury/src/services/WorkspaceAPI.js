import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";
import {createIri} from "../utils/metadataUtils";

class WorkspaceAPI {
    static getConfig = {
        method: 'GET',
        headers: new Headers({Accept: 'application/json'}),
        credentials: 'same-origin'
    };

    getUsers() {
        return fetch(Config.get().urls.users, WorkspaceAPI.getConfig)
            .then(failOnHttpError('Error while loading users'))
            .then(response => response.json())
            .then(users => users.map(user => ({...user, iri: createIri(user.id)})));
    }

    getWorkspace() {
        return fetch(Config.get().urls.workspace, WorkspaceAPI.getConfig)
            .then(failOnHttpError('Error while loading workspace details'))
            .then(response => response.json());
    }
}

export default new WorkspaceAPI();
