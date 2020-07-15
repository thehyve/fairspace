import React from 'react';
import WorkspacesAPI from './WorkspacesAPI';
import useAsync from "../common/hooks/UseAsync";

const WorkspaceUsersContext = React.createContext({});

export const WorkspaceUsersProvider = ({iri, children, workspacesAPI = WorkspacesAPI}) => {
    const {
        data: workspaceUsers = [],
        error: workspaceUsersError,
        loading: workspaceUsersLoading,
        refresh: refreshWorkspaceUsers
    } = useAsync(() => workspacesAPI.getWorkspaceUsers(iri), [iri]);

    const setWorkspaceRole = (userIri: string, role: string) => (
        workspacesAPI.setWorkspaceRole(iri, userIri, role).then(refreshWorkspaceUsers)
    );

    return (
        <WorkspaceUsersContext.Provider
            value={{
                workspaceUsers,
                workspaceUsersError,
                workspaceUsersLoading,
                refreshWorkspaceUsers,
                setWorkspaceRole
            }}
        >
            {children}
        </WorkspaceUsersContext.Provider>
    );
};

export default WorkspaceUsersContext;
