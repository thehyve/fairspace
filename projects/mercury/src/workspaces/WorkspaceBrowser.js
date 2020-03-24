// @flow
import React, {useContext, useState} from 'react';
import Button from "@material-ui/core/Button";
import {ErrorDialog, LoadingInlay, MessageDisplay, UserContext, UsersContext} from '../common';
import WorkspaceList from './WorkspaceList';
import WorkspaceContext from './WorkspaceContext';
import type {Workspace} from './WorkspacesAPI';
import WorkspaceEditor from './WorkspaceEditor';
import {isAdmin} from "../common/utils/userUtils";


type WorkspaceBrowserProps = {
    loading: boolean,
    error: boolean,
    workspaces: Workspace[],
    createWorkspace: (Workspace) => Promise<Workspace>,
    toggleWorkspace: () => {}
}

export const WorkspaceBrowser = (props: WorkspaceBrowserProps) => {
    const {loading, error, workspaces, history, createWorkspace, refreshWorkspaces, toggleWorkspace, isSelected} = props;
    const [creatingWorkspace, setCreatingWorkspace] = useState(false);
    const [loadingCreatedWorkspace, setLoadingCreatedWorkspace] = useState(false);
    const {currentUser} = useContext(UserContext);

    const handleCreateWorkspaceClick = () => setCreatingWorkspace(true);

    const handleSaveWorkspace = async (workspace: Workspace) => {
        setLoadingCreatedWorkspace(true);
        return createWorkspace(workspace)
            .then(() => refreshWorkspaces())
            .then(() => {
                setCreatingWorkspace(false);
                setLoadingCreatedWorkspace(false);
                history.push(`/workspaces/${workspace.id}/`);
            })
            .catch(err => {
                setLoadingCreatedWorkspace(false);
                const message = err && err.message ? err.message : "An error occurred while creating a workspace";
                ErrorDialog.showError(err, message);
            });
    };

    const handleCancelCreateWorkspace = () => setCreatingWorkspace(false);

    const renderWorkspaceList = () => (
    // workspaces.forEach((workspace: Workspace) => {
    //     workspace.creatorObj = users.find(u => u.iri === workspace.createdBy);
    // });
        <>
            <WorkspaceList
                workspaces={workspaces}
                toggleWorkspace={toggleWorkspace}
                isSelected={isSelected}
            />
            {creatingWorkspace ? (
                <WorkspaceEditor
                    title="Create workspace"
                    onSubmit={handleSaveWorkspace}
                    onClose={handleCancelCreateWorkspace}
                    creating={loadingCreatedWorkspace}
                    workspaces={workspaces}
                />
            ) : null}
        </>
    );

    const renderAddWorkspaceButton = () => (
        <Button
            style={{marginTop: 8}}
            color="primary"
            variant="contained"
            aria-label="Add"
            title="Create a new workspace"
            onClick={handleCreateWorkspaceClick}
        >
            New
        </Button>
    );

    if (error) {
        return <MessageDisplay message="An error occurred while loading workspaces" />;
    }

    return (
        <>
            {loading ? <LoadingInlay /> : renderWorkspaceList()}
            {isAdmin(currentUser) ? renderAddWorkspaceButton() : null }
        </>
    );
};

WorkspaceBrowser.defaultProps = {
    loading: false,
    error: false
};

const ContextualWorkspaceBrowser = (props) => {
    const {currentUserError, currentUserLoading} = useContext(UserContext);
    const {users, usersLoading, usersError} = useContext(UsersContext);
    const {workspaces, workspacesLoading, workspacesError, createWorkspace, refreshWorkspaces} = useContext(WorkspaceContext);

    return (
        <WorkspaceBrowser
            {...props}
            workspaces={workspaces}
            createWorkspace={createWorkspace}
            refreshWorkspaces={refreshWorkspaces}
            users={users}
            loading={workspacesLoading || currentUserLoading || usersLoading}
            error={workspacesError || currentUserError || usersError}
        />
    );
};

export default ContextualWorkspaceBrowser;
