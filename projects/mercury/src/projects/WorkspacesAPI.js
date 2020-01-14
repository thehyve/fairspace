// @flow
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../common';


const workspacesUrl = "/api/v1/workspaces/";

export type Workspace = {
    id: string;
}

class WorkspacesAPI {
    getWorkspaces(): Promise<Workspace[]> {
        return axios.get(workspacesUrl, {headers: {Accept: 'application/json'}})
            .catch(handleHttpError("Failure when retrieving a list of workspaces"))
            .then(extractJsonData)
            .then((ids: string[]) => ids.map((id) => ({id})));
    }
}

export default new WorkspacesAPI();
