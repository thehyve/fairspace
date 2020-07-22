// @flow
import React, {useState} from 'react';
import {IconButton, List, Menu} from '@material-ui/core';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MoreIcon from "@material-ui/icons/MoreVert";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import {canAlterPermission} from "./permissionUtils";
import ErrorDialog from "../common/components/ErrorDialog";
import ConfirmationDialog from "../common/components/ConfirmationDialog";


export const PermissionsList = ({permissions, collection, setPermission, currentUser,
    selectedPrincipal, setSelectedPrincipal, setShowPermissionDialog,
    getItemIcon}) => {
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDeletePermission = (principal) => {
        setShowConfirmDeleteDialog(true);
        setSelectedPrincipal(principal);
        setAnchorEl(null);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setShowConfirmDeleteDialog(false);
    };

    const removePermission = (principal) => {
        setPermission(collection.location, principal.iri, 'None')
            .catch(e => ErrorDialog.showError(e, 'Error removing permission.'))
            .finally(handleCloseConfirmDeleteDialog);
    };

    const renderDeletionConfirmationDialog = () => {
        if (!selectedPrincipal || !showConfirmDeleteDialog) {
            return null;
        }

        const content = `Are you sure you want to remove permission for "${selectedPrincipal.name}"?`;

        return (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={content}
                dangerous
                agreeButtonText="Remove"
                onAgree={() => removePermission(selectedPrincipal)}
                onDisagree={handleCloseConfirmDeleteDialog}
                onClose={handleCloseConfirmDeleteDialog}
            />
        );
    };

    const handleAlterPermission = (principal) => {
        setShowPermissionDialog(true);
        setSelectedPrincipal(principal);
        setAnchorEl(null);
    };

    const handleMenuClick = (event, principal) => {
        setAnchorEl(event.currentTarget);
        setSelectedPrincipal(principal);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedPrincipal(null);
    };

    const selectedPermissionKey = selectedPrincipal ? selectedPrincipal.access + selectedPrincipal.iri : null;

    return (
        <div style={{paddingLeft: 16}}>
            <List dense disablePadding>
                {
                    permissions.map(p => {
                        const key = p.access + p.iri;
                        return (
                            <ListItem key={p.iri}>
                                <ListItemIcon>
                                    {getItemIcon(p)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={p.name}
                                    secondary={p.access}
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                />
                                {collection.canManage && (
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            onClick={e => handleMenuClick(e, p)}
                                            disabled={currentUser && !canAlterPermission(collection.canManage, p, currentUser)}
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
                                                onClick={() => handleAlterPermission(p)}
                                            >
                                                Change access
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => handleDeletePermission(p)}
                                            >
                                                Delete
                                            </MenuItem>
                                        </Menu>
                                    </ListItemSecondaryAction>
                                )}
                            </ListItem>
                        );
                    })
                }
            </List>
            {renderDeletionConfirmationDialog()}
        </div>
    );
};

export default PermissionsList;
