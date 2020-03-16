// @flow
import axios from 'axios';

import {extractJsonData, handleHttpError} from '../common';

const workspacesUrl = "/api/v1/workspaces/";

export type Workspace = {
    id: string;
    label?: string;
    description?: string;
    node: string;
}

class WorkspacesAPI {
    getWorkspaces(): Promise<Workspace[]> {
        return axios.get(workspacesUrl, {
            headers: {Accept: 'application/json'},
        })
            .catch(handleHttpError("Failure when retrieving a list of workspaces"))
            .then(extractJsonData);
    }

    createWorkspace(workspace: Workspace): Promise<Workspace> {
        return axios.put(`${workspacesUrl}${workspace.id}`, '', {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .catch(handleHttpError("Failure while creating a workspace"));
    }
}

const workspacesAPI = new WorkspacesAPI();

export default workspacesAPI;
