import React, {useContext} from 'react';
import WorkspacesAPI from './WorkspacesAPI';
import useAsync from "../common/hooks/UseAsync";
import WorkspaceContext from "./WorkspaceContext";

const WorkspaceUserRolesContext = React.createContext({});

export const WorkspaceUserRolesProvider = ({iri, children, workspacesAPI = WorkspacesAPI}) => {
    const {
        data: workspaceRoles = [],
        error: workspaceRolesError,
        loading: workspaceRolesLoading,
        refresh: refreshWorkspaceRoles
    } = useAsync(() => workspacesAPI.getWorkspaceRoles(iri), [iri]);

    const {refreshWorkspaces} = useContext(WorkspaceContext);

    const setWorkspaceRole = (userIri: string, role: string) => (
        workspacesAPI.setWorkspaceRole(iri, userIri, role)
            .then(refreshWorkspaceRoles)
            .then(refreshWorkspaces)
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
