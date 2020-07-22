import React, {useState} from 'react';
import {Button, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Menu} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import MoreIcon from '@material-ui/icons/MoreVert';

import AlterPermissionContainer from "./AlterPermissionContainer";
import {canAlterPermission, sortPermissions} from './permissionUtils';
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";

const PermissionsViewer = ({
    collection, usersWithCollectionAccess, workspaceWithCollectionAccess, workspaceUsers, workspaces,
    setPermission, error, loading, currentUser
}) => {
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    let sortedCollaboratorsList = sortPermissions(usersWithCollectionAccess);
    if (workspaceWithCollectionAccess) {
        sortedCollaboratorsList = [workspaceWithCollectionAccess, ...sortedCollaboratorsList];
    }
    const ownerWorkspace = workspaces.find(w => w.iri === collection.ownerWorkspace);

    const handleAlterPermission = (user) => {
        setShowPermissionDialog(true);
        setSelectedUser(user);
        setAnchorEl(null);
    };

    const handleAlterOwnerWorkspacePermission = () => {
        setShowPermissionDialog(true);
        setSelectedUser(ownerWorkspace);
        setAnchorEl(null);
    };

    const handleShareWithDialogClose = () => {
        setShowPermissionDialog(false);
        setSelectedUser(null);
    };

    const handleRemoveCollaborator = (collaborator) => {
        setShowConfirmDeleteDialog(true);
        setSelectedUser(collaborator);
        setAnchorEl(null);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setShowConfirmDeleteDialog(false);
    };

    const handleDeleteCollaborator = () => {
        if (selectedUser) {
            setPermission(collection.location, selectedUser.iri, 'None');
            handleCloseConfirmDeleteDialog();
        }
    };

    const handleMenuClick = (event, {iri, access}) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser({iri, access});
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const renderCollaboratorList = () => {
        const selectedPermissionKey = selectedUser
            ? selectedUser.access + selectedUser.iri
            : null;

        return sortedCollaboratorsList
            .map((collaborator) => {
                const key = collaborator.access + collaborator.iri;
                return (
                    <ListItem
                        key={key}
                    >
                        <ListItemText
                            primary={collaborator.name}
                            secondary={collaborator.access}
                            data-testid="collaborator"
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={e => handleMenuClick(e, collaborator)}
                                disabled={!canAlterPermission(collection.canManage, collaborator, currentUser)}
                            >
                                <MoreIcon />
                            </IconButton>
                            <Menu
                                id="more-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && key === selectedPermissionKey}
                                onClose={handleMenuClose}
                            >
                                <MenuItem
                                    onClick={() => handleAlterPermission(collaborator)}
                                >
                                    Change access
                                </MenuItem>
                                <MenuItem
                                    onClick={() => handleRemoveCollaborator(collaborator)}
                                >
                                    Delete
                                </MenuItem>
                            </Menu>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            });
    };

    const renderUserList = () => (
        <List dense disablePadding>
            {renderCollaboratorList(usersWithCollectionAccess)}
            {collection.canManage && (
                <div>
                    <Button
                        variant="text"
                        title="Add single collaborator"
                        aria-label="Add collaborator"
                        color="primary"
                        onClick={() => handleAlterPermission(null)}
                    >
                        Add collaborator
                    </Button>
                    <Button
                        variant="text"
                        title="Add all owner workspace members"
                        aria-label="Add all members"
                        color="primary"
                        onClick={handleAlterOwnerWorkspacePermission}
                        disabled={workspaceWithCollectionAccess}
                    >
                        Add access to all members
                    </Button>
                </div>
            )}
        </List>
    );

    const renderPermissionDialog = () => (
        <AlterPermissionContainer
            open={showPermissionDialog}
            onClose={handleShareWithDialogClose}
            user={selectedUser}
            access={selectedUser && selectedUser.access}
            collection={collection}
            currentUser={currentUser}
            usersWithCollectionAccess={usersWithCollectionAccess}
            workspaceUsers={workspaceUsers}
        />
    );

    const renderConfirmationDialog = () => {
        if (!selectedUser || !showConfirmDeleteDialog) {
            return null;
        }

        const content = `Are you sure you want to remove "${selectedUser.name}" from the collaborator list?`;

        return (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={content}
                dangerous
                agreeButtonText="Remove"
                onAgree={handleDeleteCollaborator}
                onDisagree={handleCloseConfirmDeleteDialog}
                onClose={handleCloseConfirmDeleteDialog}
            />
        );
    };

    if (error) {
        return (<MessageDisplay message="An error occurred loading permissions" />);
    } if (loading) {
        return (<LoadingInlay />);
    } if (!usersWithCollectionAccess) {
        return (<div>No permission found</div>);
    }

    return (
        <>
            {renderPermissionDialog()}
            {renderConfirmationDialog()}
            {renderUserList()}
        </>
    );
};

PermissionsViewer.defaultProps = {
    renderPermissionsDialog: () => {}
};

export default PermissionsViewer;
