// @flow
import React, {useContext, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {IconButton, Menu, MenuItem} from '@material-ui/core';
import {MoreVert} from '@material-ui/icons';
import type {Workspace, WorkspaceProperties} from './WorkspacesAPI';
import ConfirmationDialog from '../common/components/ConfirmationDialog';
import ErrorDialog from '../common/components/ErrorDialog';
import WorkspaceContext from './WorkspaceContext';
import {currentWorkspace} from './workspaces';
import WorkspaceEditor from './WorkspaceEditor';
import CollectionsContext from '../collections/CollectionsContext';

type WorkspaceActionMenuProps = {
    workspace: Workspace;
    small: boolean;
    onUpdate?: () => void;
}

const WorkspaceActionMenu = (props: WorkspaceActionMenuProps) => {
    const {workspace, small, onUpdate} = props;
    const history = useHistory();
    const {workspaces, updateWorkspace, deleteWorkspace} = useContext(WorkspaceContext);
    const {collections} = useContext(CollectionsContext);

    const isWorkspaceEmpty = !collections.some(c => c.ownerWorkspace === workspace.iri);

    const [anchorEl, setAnchorEl] = useState(null);
    const [showDeletionConfirmDialog, setShowDeletionConfirmDialog] = useState(false);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const openDeleteWorkspaceDialog = () => {
        setShowDeletionConfirmDialog(true);
        setAnchorEl(null);
    };

    const closeDeleteWorkspaceDialog = () => {
        setShowDeletionConfirmDialog(false);
        setAnchorEl(null);
    };

    const handleDeleteWorkspace = () => {
        closeDeleteWorkspaceDialog();
        deleteWorkspace(workspace)
            .then(() => {
                if (currentWorkspace()) {
                    history.push('/workspaces');
                }
            })
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a workspace",
                () => handleDeleteWorkspace(workspace)
            ));
    };

    const renderDeletionConfirmation = () => (
        <ConfirmationDialog
            open
            title="Confirmation"
            content={`Are you sure you want to delete workspace ${workspace.name}? This operation cannot be reverted.`}
            dangerous
            agreeButtonText="Yes"
            onAgree={handleDeleteWorkspace}
            onDisagree={closeDeleteWorkspaceDialog}
            onClose={closeDeleteWorkspaceDialog}
        />
    );

    const [renamingWorkspace, setRenamingWorkspace] = useState(false);

    const openRenameWorkspaceDialog = () => {
        setRenamingWorkspace(true);
        setAnchorEl(null);
    };

    const closeRenameWorkspaceDialog = () => {
        setRenamingWorkspace(false);
        setAnchorEl(null);
    };

    const handleRenameWorkspace = (ws: WorkspaceProperties) => {
        updateWorkspace({iri: workspace.iri, name: ws.name})
            .then(() => {
                closeRenameWorkspaceDialog();
                if (onUpdate) {
                    onUpdate();
                }
            })
            .catch(err => {
                const message = err && err.message ? err.message : "An error occurred while renaming the workspace";
                ErrorDialog.showError(err, message);
            });
    };

    return (
        <>
            <IconButton
                size={small ? 'small' : 'medium'}
                aria-label="More"
                aria-owns={`workspace-menu-${workspace.iri}`}
                aria-haspopup="true"
                onClick={(event) => handleMenuClick(event, workspace)}
            >
                <MoreVert fontSize={small ? 'small' : 'default'} />
            </IconButton>
            <Menu
                id={`workspace-menu-${workspace.iri}`}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem
                    title="Rename workspace."
                    onClick={openRenameWorkspaceDialog}
                >
                    Rename workspace &hellip;
                </MenuItem>
                { isWorkspaceEmpty && (
                    <MenuItem
                        title="Delete empty workspace."
                        onClick={openDeleteWorkspaceDialog}
                    >
                        Delete workspace &hellip;
                    </MenuItem>
                )}
            </Menu>
            { showDeletionConfirmDialog && renderDeletionConfirmation() }
            { renamingWorkspace && (
                <WorkspaceEditor
                    title={`Rename workspace ${workspace.name}`}
                    onSubmit={handleRenameWorkspace}
                    onClose={closeRenameWorkspaceDialog}
                    workspace={{name: workspace.name}}
                    workspaces={workspaces}
                />
            ) }
        </>
    );
};

WorkspaceActionMenu.defaultProps = {
    small: false
};

export default WorkspaceActionMenu;
