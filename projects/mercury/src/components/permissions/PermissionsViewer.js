import React from 'react';
import {
    withStyles, List, ListItem, ListItemSecondaryAction,
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

export const styles = () => ({
    collaboratorList: {
        width: '100%'
    },
    buttonList: {
        marginTop: '1em'
    }
});

export class PermissionsViewer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPermissionDialog: false,
            showConfirmDeleteDialog: false,
            selectedUser: null
        };
    }

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
        this.setState({
            showConfirmDeleteDialog: false,
        });
    };

    handleClick = (event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    closeMenu = () => {
        this.setState({anchorEl: null});
    };

    renderCollaboratorList(permissions) {
        const {canManage, currentUser} = this.props;

        return sortPermissions(permissions)
            .map((p) => (
                <ListItem
                    key={p.access + p.collectionId + p.subject}
                >
                    <ListItemText primary={getDisplayName(p.user)} secondary={p.access} />
                    <ListItemSecondaryAction>
                        <IconButton
                            onClick={this.handleClick}
                            disabled={!canAlterPermission(canManage, p, currentUser)}
                        >
                            <MoreIcon />
                        </IconButton>
                        <Menu
                            id="more-menu"
                            anchorEl={this.state.anchorEl}
                            open={Boolean(this.state.anchorEl)}
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
            ));
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
        const {
            classes, permissions, error, loading, altering
        } = this.props;

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
            <div className={classes.collaboratorList}>
                {this.renderPermissionDialog()}
                {this.renderConfirmationDialog()}
                {this.renderUserList(permissions)}
            </div>
        );
    }
}

export default withStyles(styles, {withTheme: true})(PermissionsViewer);
