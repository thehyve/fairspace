import React from 'react';
import {
    List, ListItem, ListItemSecondaryAction,
    ListItemText, IconButton, Menu, Button
} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import MoreIcon from '@material-ui/icons/MoreVert';

import {
    ErrorMessage, ConfirmationDialog, LoadingInlay,
    LoadingOverlay
} from "../common";
import AlterPermissionContainer from "./AlterPermissionContainer";
import getDisplayName from "../../utils/userUtils";
import {findById} from "../../utils/arrayUtils";
import {canAlterPermission, sortPermissions} from '../../utils/permissionUtils';

class PermissionsViewer extends React.Component {
    state = {
        showPermissionDialog: false,
        showConfirmDeleteDialog: false,
        selectedUser: null,
        selectedPermission: null
    };

    componentDidMount() {
        const {collectionId, fetchPermissionsIfNeeded} = this.props;

        if (collectionId) {
            fetchPermissionsIfNeeded(collectionId);
        }
    }

    componentDidUpdate() {
        const {collectionId, fetchPermissionsIfNeeded} = this.props;

        if (collectionId) {
            fetchPermissionsIfNeeded(collectionId);
        }
    }

    handleAlterPermission = (user) => {
        this.setState({
            showPermissionDialog: true,
            selectedUser: user,
            anchorEl: null
        });
    };

    handleShareWithDialogClose = () => {
        this.setState({
            showPermissionDialog: false,
            selectedUser: null,
        });
    };

    handleRemoveCollaborator = (collaborator) => {
        this.setState({
            selectedUser: collaborator,
            showConfirmDeleteDialog: true,
            anchorEl: null
        });
    };

    handleDeleteCollaborator = () => {
        const {collectionId, alterPermission} = this.props;
        const {selectedUser} = this.state;

        if (selectedUser) {
            alterPermission(selectedUser.subject, collectionId, 'None');
            this.handleCloseConfirmDeleteDialog();
        }
    };

    handleCloseConfirmDeleteDialog = () => {
        this.setState({showConfirmDeleteDialog: false});
    };

    handleMenuClick = (event, permission) => {
        this.setState({
            anchorEl: event.currentTarget,
            selectedPermission: permission
        });
    };

    handleMenuClose = () => {
        this.setState({
            anchorEl: null,
            selectedPermission: null
        });
    };

    renderCollaboratorList(permissions) {
        const {canManage, currentUser} = this.props;
        const {anchorEl, selectedPermission} = this.state;

        const selectedPermissionKey = selectedPermission
            ? selectedPermission.access + selectedPermission.collectionId + selectedPermission.subject
            : null;

        return sortPermissions(permissions)
            .map((p) => {
                const key = p.access + p.collectionId + p.subject;
                return (
                    <ListItem
                        key={key}
                    >
                        <ListItemText primary={getDisplayName(p.user)} secondary={p.access} />
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={e => this.handleMenuClick(e, p)}
                                disabled={!canAlterPermission(canManage, p, currentUser)}
                            >
                                <MoreIcon />
                            </IconButton>
                            <Menu
                                id="more-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && key === selectedPermissionKey}
                                onClose={this.handleMenuClose}
                            >
                                <MenuItem
                                    onClick={() => this.handleAlterPermission(p)}
                                >
                                    Change access
                                </MenuItem>
                                <MenuItem
                                    onClick={() => this.handleRemoveCollaborator(p)}
                                >
                                    Delete
                                </MenuItem>
                            </Menu>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            });
    }

    renderUserList = (permissions) => {
        const {users, canManage} = this.props;

        // Extend the permissions map with the user itself
        const permissionsWithUsers = permissions.map(p => ({
            ...p,
            user: findById(users, p.subject)
        }));

        const addButton = canManage ? (
            <Button
                variant="text"
                title="Add a collaborator"
                aria-label="Add"
                onClick={() => this.handleAlterPermission()}
                disabled={!canManage}
            >
                Add
            </Button>
        ) : null;

        return (
            <List dense disablePadding>
                {this.renderCollaboratorList(permissionsWithUsers)}
                {addButton}
            </List>
        );
    };

    renderPermissionDialog = () => {
        const {collectionId, currentUser} = this.props;
        const {selectedUser, showPermissionDialog} = this.state;

        return (
            <AlterPermissionContainer
                open={showPermissionDialog}
                onClose={this.handleShareWithDialogClose}
                user={selectedUser}
                collectionId={collectionId}
                currentUser={currentUser}
            />
        );
    };

    renderConfirmationDialog = () => {
        const {selectedUser, showConfirmDeleteDialog} = this.state;
        const fullName = selectedUser && getDisplayName(selectedUser.user);
        const content = `Are you sure you want to remove "${fullName}" from the collaborator list?`;

        return (
            <ConfirmationDialog
                open={showConfirmDeleteDialog}
                title="Confirmation"
                content={content}
                onAgree={this.handleDeleteCollaborator}
                onDisagree={this.handleCloseConfirmDeleteDialog}
                onClose={this.handleCloseConfirmDeleteDialog}
            />
        );
    };

    render() {
        const {permissions, error, loading, altering} = this.props;

        if (error) {
            return (<ErrorMessage message="An error occurred loading permissions" />);
        } if (loading) {
            return (<LoadingInlay />);
        } if (altering) {
            return (<LoadingOverlay loading />);
        } if (!permissions) {
            return (<div>No permission found</div>);
        }

        return (
            <>
                {this.renderPermissionDialog()}
                {this.renderConfirmationDialog()}
                {this.renderUserList(permissions)}
            </>
        );
    }
}

export default PermissionsViewer;
