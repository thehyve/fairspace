import React from 'react';
import type {Workspace} from './WorkspacesAPI';
import WorkspacesAPI from './WorkspacesAPI';
import {useAsync} from '../common/hooks';

const WorkspaceContext = React.createContext({});

export const WorkspacesProvider = ({children, workspacesAPI = WorkspacesAPI}) => {
    const {data: workspaces = [], error: workspacesError, loading: workspacesLoading, refresh: refreshWorkspaces} = useAsync(workspacesAPI.getWorkspaces);
    const createWorkspace = (workspace: Workspace) => workspacesAPI.createWorkspace(workspace);

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                workspacesError,
                workspacesLoading,
                refreshWorkspaces,
                createWorkspace
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

export default WorkspaceContext;
