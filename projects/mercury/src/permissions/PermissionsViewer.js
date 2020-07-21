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
    collection, usersWithCollectionAccess, workspaceUsers, setPermission, error, loading, currentUser
}) => {
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleAlterPermission = ({iri, access}) => {
        setShowPermissionDialog(true);
        setSelectedUser({iri, access});
        setAnchorEl(null);
    };

    const handleShareWithDialogClose = () => {
        setShowPermissionDialog(false);
        setSelectedUser(null);
    };

    const handleRemoveCollaborator = ({iri, access}) => {
        setShowConfirmDeleteDialog(true);
        setSelectedUser({iri, access});
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

        return sortPermissions(usersWithCollectionAccess)
            .map((userWithAccess) => {
                const key = userWithAccess.access + userWithAccess.iri;
                return (
                    <ListItem
                        key={key}
                    >
                        <ListItemText
                            primary={userWithAccess.name}
                            secondary={userWithAccess.access}
                            data-testid="collaborator"
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={e => handleMenuClick(e, userWithAccess)}
                                disabled={!canAlterPermission(collection.canManage, userWithAccess, currentUser)}
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
                                    onClick={() => handleAlterPermission(userWithAccess)}
                                >
                                    Change access
                                </MenuItem>
                                <MenuItem
                                    onClick={() => handleRemoveCollaborator(userWithAccess)}
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
                <Button
                    variant="text"
                    title="Add a collaborator"
                    aria-label="Add"
                    color="primary"
                    onClick={() => handleAlterPermission({})}
                    disabled={!collection.canManage}
                >
                    Add
                </Button>
            )}
        </List>
    );

    const renderPermissionDialog = () => (
        <AlterPermissionContainer
            open={showPermissionDialog}
            onClose={handleShareWithDialogClose}
            user={selectedUser && selectedUser.iri}
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

        // TODO: Refactor variable naming: user vs iri vs id.
        const user = usersWithCollectionAccess.find(u => u.iri === selectedUser.iri) || {};
        const content = `Are you sure you want to remove "${user.name}" from the collaborator list?`;

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
