// @flow
import axios from 'axios';

import {extractJsonData, handleHttpError} from '../common/utils/httpUtils';
import type {User} from '../users/UsersAPI';

const workspacesUrl = "/api/workspaces/";

export type WorkspaceUserRole = {
    iri: string;
    role: string;
};

export type WorkspacePermissions = {|
    canCollaborate: boolean;
    canManage: boolean;
|};

export type WorkspaceSummary = {|
    totalCollectionCount: number;
    nonDeletedCollectionCount: number;
    memberCount: number;
|};
export type WorkspaceProperties = {|
    iri: string;
    code?: string;
    title?: string;
    description?: string;
    summary ?: WorkspaceSummary;
    managers?: User[];
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
            .then(extractJsonData)
            .catch(handleHttpError("Failure when retrieving a list of workspaces"));
    }

    createWorkspace(workspace: WorkspaceProperties): Promise<WorkspaceProperties> {
        return axios.put(workspacesUrl, JSON.stringify(workspace), {
            headers: {Accept: 'application/json', 'Content-type': 'application/json'},
        })
            .then(extractJsonData)
            .catch(handleHttpError("Failure while creating a workspace"));
    }

    deleteWorkspace(workspaceIri: string): Promise<WorkspaceProperties> {
        return axios.delete(`${workspacesUrl}?workspace=${encodeURI(workspaceIri)}`, {
            headers: {Accept: 'application/json'},
        })
            .catch(handleHttpError("Failure while deleting a workspace"));
    }

    getWorkspaceRoles(workspaceIri: string): Promise<WorkspaceUserRole[]> {
        return axios.get(`${workspacesUrl}users/?workspace=${encodeURI(workspaceIri)}`, {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .then(roles => Object.entries(roles).map(([iri, role]) => ({iri, role})))
            .catch(handleHttpError("Failure while retrieving workspace users"));
    }

    setWorkspaceRole(workspace: string, user: string, role: string): Promise<void> {
        return axios.patch(`${workspacesUrl}users/`, JSON.stringify({workspace, user, role}), {
            headers: {'Content-type': 'application/json', 'Accept': 'application/json'}
        })
            .catch(e => {
                console.error('Failure while updating a workspace role.', e);
                throw new Error('Failure while updating a workspace role.');
            });
    }
}

const workspacesAPI = new WorkspacesAPI();

export default workspacesAPI;
