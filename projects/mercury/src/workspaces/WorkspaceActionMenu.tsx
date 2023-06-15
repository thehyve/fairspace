// @ts-nocheck
// @ts-nocheck
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import type { Workspace } from "./WorkspacesAPI";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import ErrorDialog from "../common/components/ErrorDialog";
import WorkspaceContext from "./WorkspaceContext";
import { currentWorkspace } from "./workspaces";
type WorkspaceActionMenuProps = {
  workspace: Workspace;
  small: boolean;
};

const WorkspaceActionMenu = (props: WorkspaceActionMenuProps) => {
  const {
    workspace,
    small
  } = props;
  const history = useHistory();
  const {
    deleteWorkspace
  } = useContext(WorkspaceContext);
  const isWorkspaceEmpty = workspace.summary.totalCollectionCount === 0;
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDeletionConfirmDialog, setShowDeletionConfirmDialog] = useState(false);

  const handleMenuClick = event => {
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
    deleteWorkspace(workspace).then(() => {
      if (currentWorkspace()) {
        history.push('/workspaces');
      }
    }).catch(err => ErrorDialog.showError("An error occurred while deleting a workspace", err, () => handleDeleteWorkspace(workspace)));
  };

  const renderDeletionConfirmation = () => <ConfirmationDialog open title="Confirmation" content={`Are you sure you want to delete workspace ${workspace.code}? This operation cannot be reverted.`} dangerous agreeButtonText="Yes" onAgree={handleDeleteWorkspace} onDisagree={closeDeleteWorkspaceDialog} onClose={closeDeleteWorkspaceDialog} />;

  if (!isWorkspaceEmpty) {
    return null;
  }

  return <>
            <IconButton size={small ? 'small' : 'medium'} aria-label="More" aria-owns={`workspace-menu-${workspace.iri}`} aria-haspopup="true" onClick={event => handleMenuClick(event, workspace)}>
                <MoreVert fontSize={small ? 'small' : 'default'} />
            </IconButton>
            <Menu id={`workspace-menu-${workspace.iri}`} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem title="Delete empty workspace." onClick={openDeleteWorkspaceDialog}>
                    Delete workspace &hellip;
                </MenuItem>
            </Menu>
            {showDeletionConfirmDialog && renderDeletionConfirmation()}
        </>;
};

WorkspaceActionMenu.defaultProps = {
  small: false
};
export default WorkspaceActionMenu;