import React from 'react';
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
import UserContext from '../../UserContext';

class PermissionsViewer extends React.Component {
    static contextType = UserContext;

    state = {
        showPermissionDialog: false,
        showConfirmDeleteDialog: false,
        selectedPermission: null
    };

    handleAlterPermission = ({user, access}) => {
        this.setState({
            showPermissionDialog: true,
            selectedPermission: {user, access},
            anchorEl: null
        });
    };

    handleShareWithDialogClose = () => {
        this.setState({
            showPermissionDialog: false,
            selectedPermission: null,
        });
    };

    handleRemoveCollaborator = ({user, access}) => {
        this.setState({
            selectedPermission: {user, access},
            showConfirmDeleteDialog: true,
            anchorEl: null
        });
    };

    handleDeleteCollaborator = () => {
        const {iri, alterPermission} = this.props;
        const {selectedPermission} = this.state;

        if (selectedPermission) {
            alterPermission(selectedPermission.user, iri, 'None');
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
        const {canManage} = this.props;
        const {anchorEl, selectedPermission} = this.state;
        const {currentUser} = this.context;

        const selectedPermissionKey = selectedPermission
            ? selectedPermission.access + selectedPermission.user
            : null;

        return sortPermissions(permissions)
            .map((permission) => {
                const key = permission.access + permission.user;
                return (
                    <ListItem
                        key={key}
                    >
                        <ListItemText primary={permission.userName} secondary={permission.access} />
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={e => this.handleMenuClick(e, permission)}
                                disabled={!canAlterPermission(canManage, permission, currentUser)}
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
                                    onClick={() => this.handleAlterPermission(permission)}
                                >
                                    Change access
                                </MenuItem>
                                <MenuItem
                                    onClick={() => this.handleRemoveCollaborator(permission)}
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
        const {canManage} = this.props;

        const addButton = canManage ? (
            <Button
                variant="text"
                title="Add a collaborator"
                aria-label="Add"
                onClick={() => this.handleAlterPermission({})}
                disabled={!canManage}
            >
                Add
            </Button>
        ) : null;

        return (
            <List dense disablePadding>
                {this.renderCollaboratorList(permissions)}
                {addButton}
            </List>
        );
    };

    renderPermissionDialog = () => {
        const {iri, currentUser, alterPermission} = this.props;
        const {selectedPermission, showPermissionDialog} = this.state;

        return (
            <AlterPermissionContainer
                open={showPermissionDialog}
                alterPermission={alterPermission}
                onClose={this.handleShareWithDialogClose}
                user={selectedPermission && selectedPermission.user}
                access={selectedPermission && selectedPermission.access}
                iri={iri}
                currentUser={currentUser}
            />
        );
    };

    renderConfirmationDialog = () => {
        const {selectedPermission, showConfirmDeleteDialog} = this.state;
        const fullName = selectedPermission && getDisplayName(selectedPermission.user);
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
                {this.renderPermissionDialog()}
                {this.renderConfirmationDialog()}
                {this.renderUserList(permissions)}
            </>
        );
    }
}

PermissionsViewer.defaultProps = {
    renderPermissionsDialog: () => {}
};

export default PermissionsViewer;
