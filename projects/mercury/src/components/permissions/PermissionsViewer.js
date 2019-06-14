import React, {useContext, useState, useEffect} from 'react';
import {
    List, ListItem, ListItemSecondaryAction,
    ListItemText, IconButton, Menu, Button
} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import MoreIcon from '@material-ui/icons/MoreVert';

import {
    MessageDisplay, ConfirmationDialog, LoadingInlay,
    LoadingOverlay
} from "../common";
import AlterPermissionContainer from "./AlterPermissionContainer";
import getDisplayName from "../../utils/userUtils";
import {canAlterPermission, sortPermissions} from '../../utils/permissionUtils';
import {UserContext} from '../../UserContext';

const PermissionsViewer = ({
    users, iri, fetchPermissionsIfNeeded, permissions,
    error, loading, altering, canManage, alterPermission
}) => {
    const {currentUser} = useContext(UserContext);

    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (iri) {
            fetchPermissionsIfNeeded(iri);
        }
    }, [iri, fetchPermissionsIfNeeded]);


    const handleAlterPermission = ({user, access}) => {
        setShowPermissionDialog(true);
        setSelectedPermission({user, access});
        setAnchorEl(null);
    };

    const handleShareWithDialogClose = () => {
        setShowPermissionDialog(false);
        setSelectedPermission(null);
    };

    const handleRemoveCollaborator = ({user, access}) => {
        setSelectedPermission({user, access});
        setShowConfirmDeleteDialog(true);
        setAnchorEl(null);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setShowConfirmDeleteDialog(false);
    };

    const handleDeleteCollaborator = () => {
        if (selectedPermission) {
            alterPermission(selectedPermission.user, iri, 'None');
            handleCloseConfirmDeleteDialog();
        }
    };

    const handleMenuClick = (event, permission) => {
        setAnchorEl(event.currentTarget);
        setSelectedPermission(permission);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedPermission(null);
    };

    const renderCollaboratorList = () => {
        const selectedPermissionKey = selectedPermission
            ? selectedPermission.access + selectedPermission.user
            : null;

        const permissionsWithUserNames = permissions.map(permission => ({...permission, userName: getDisplayName(users.find(user => permission.user === user.iri))}));

        return sortPermissions(permissionsWithUserNames)
            .map((permission) => {
                const key = permission.access + permission.user;
                return (
                    <ListItem
                        key={key}
                    >
                        <ListItemText primary={permission.userName} secondary={permission.access} />
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={e => handleMenuClick(e, permission)}
                                disabled={!canAlterPermission(canManage, permission, currentUser)}
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
                                    onClick={() => handleAlterPermission(permission)}
                                >
                                    Change access
                                </MenuItem>
                                <MenuItem
                                    onClick={() => handleRemoveCollaborator(permission)}
                                >
                                    Delete
                                </MenuItem>
                            </Menu>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            });
    };

    const renderUserList = () => {
        const addButton = canManage ? (
            <Button
                variant="text"
                title="Add a collaborator"
                aria-label="Add"
                onClick={() => handleAlterPermission({})}
                disabled={!canManage}
            >
                Add
            </Button>
        ) : null;

        return (
            <List dense disablePadding>
                {renderCollaboratorList(permissions)}
                {addButton}
            </List>
        );
    };

    const renderPermissionDialog = () => (
        <AlterPermissionContainer
            open={showPermissionDialog}
            onClose={handleShareWithDialogClose}
            user={selectedPermission && selectedPermission.user}
            access={selectedPermission && selectedPermission.access}
            iri={iri}
            currentUser={currentUser}
        />
    );

    const renderConfirmationDialog = () => {
        const fullName = selectedPermission && getDisplayName(selectedPermission.user);
        const content = `Are you sure you want to remove "${fullName}" from the collaborator list?`;

        return (
            <ConfirmationDialog
                open={showConfirmDeleteDialog}
                title="Confirmation"
                content={content}
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
    } if (altering) {
        return (<LoadingOverlay loading />);
    } if (!permissions) {
        return (<div>No permission found</div>);
    }

    return (
        <>
            {renderPermissionDialog()}
            {renderConfirmationDialog()}
            {renderUserList(permissions)}
        </>
    );
};

export default PermissionsViewer;
