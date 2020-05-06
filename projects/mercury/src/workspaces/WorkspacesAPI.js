// @flow
import axios from 'axios';

import {extractJsonData, handleHttpError} from '../common/utils/httpUtils';

const workspacesUrl = "/api/v1/workspaces/";

export type WorkspacePermissions = {|
    canRead: boolean;
    canWrite: boolean;
    canManage: boolean;
|};

export type WorkspaceProperties = {|
    id: string;
    name?: string;
    description?: string;
    node: string;
    status: string;
|}

export type Resource = {|
    iri: string;
|};

export type Workspace = WorkspacePermissions & WorkspaceProperties & Resource;

class WorkspacesAPI {
    getWorkspaces(): Promise<Workspace[]> {
        return axios.get(workspacesUrl, {
            headers: {Accept: 'application/json'},
        })
            .catch(handleHttpError("Failure when retrieving a list of workspaces"))
            .then(extractJsonData);
    }

    createWorkspace(workspace: WorkspaceProperties): Promise<WorkspaceProperties> {
        return axios.put(`${workspacesUrl}${workspace.id}`, '', {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .catch(handleHttpError("Failure while creating a workspace"));
    }
}

const workspacesAPI = new WorkspacesAPI();

export default workspacesAPI;
