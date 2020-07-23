// @flow
import axios from 'axios';

import {extractJsonData, handleHttpError} from '../common/utils/httpUtils';

const workspacesUrl = "/api/v1/workspaces/";

export type WorkspacePermissions = {|
    canCollaborate: boolean;
    canManage: boolean;
|};

export type WorkspaceProperties = {|
    iri: string;
    name?: string;
    description?: string;
    status: string;
    statusDateModified?: string;
    statusModifiedBy?: string; // iri
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
        return axios.put(workspacesUrl, JSON.stringify(workspace), {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .catch(handleHttpError("Failure while creating a workspace"));
    }

    updateWorkspace(workspace: Workspace): Promise<void> {
        return axios.patch(workspacesUrl, JSON.stringify(workspace), {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .catch(handleHttpError("Failure while updating a workspace status"));
    }

    getWorkspaceUsers(iri: string): Promise<void> {
        return axios.get(`${workspacesUrl}/users/?workspace=${encodeURI(iri)}`, {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .then(roles => Object.entries(roles).map(([iri, role]) => ({iri, role})))
            .catch(handleHttpError("Failure while retrieving workspace users"));
    }

    setWorkspaceRole(workspace: string, user: string, role: string): Promise<void> {
        return axios.patch(`${workspacesUrl}/users/`, JSON.stringify({workspace, user, role}), {})
            .catch(handleHttpError("Failure while updating a workspace role"));
    }
}

const workspacesAPI = new WorkspacesAPI();

export default workspacesAPI;
