import React from 'react';
import WorkspacesAPI from './WorkspacesAPI';
import useAsync from "../common/hooks/UseAsync";

const WorkspaceUserRolesContext = React.createContext({});

export const WorkspaceUserRolesProvider = ({iri, children, workspacesAPI = WorkspacesAPI}) => {
    const {
        data: workspaceRoles = [],
        error: workspaceRolesError,
        loading: workspaceRolesLoading,
        refresh: refreshWorkspaceRoles
    } = useAsync(() => workspacesAPI.getWorkspaceRoles(iri), [iri]);

    const setWorkspaceRole = (userIri: string, role: string) => (
        workspacesAPI.setWorkspaceRole(iri, userIri, role).then(refreshWorkspaceRoles)
    );

    return (
        <WorkspaceUserRolesContext.Provider
            value={{
                workspaceRoles,
                workspaceRolesError,
                workspaceRolesLoading,
                refreshWorkspaceRoles,
                setWorkspaceRole
            }}
        >
            {children}
        </WorkspaceUserRolesContext.Provider>
    );
};

export default WorkspaceUserRolesContext;
