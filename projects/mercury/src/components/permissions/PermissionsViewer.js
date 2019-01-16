import React from 'react';
import Fab from "@material-ui/core/Fab";
import Icon from "@material-ui/core/Icon";
import {withStyles} from "@material-ui/core/styles/index";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import {compose} from "redux";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import Menu from "@material-ui/core/Menu";
import ErrorMessage from "../common/ErrorMessage";
import ConfirmationDialog from "../common/ConfirmationDialog";
import LoadingInlay from '../common/LoadingInlay';
import LoadingOverlay from "../common/LoadingOverlay";
import AlterPermissionContainer from "./AlterPermissionContainer";
import {compareBy, comparing} from "../../utils/comparisionUtils";
import getDisplayName from "../../utils/userUtils";
import withHovered from "../common/WithHovered";
import {findById} from "../../utils/arrayUtils";

export const styles = () => ({
    collaboratorList: {
        width: '100%'
    },
    buttonList: {
        marginTop: '1em'
    }
});


/**
 * Get permission level
 * @param p
 * @returns {*}
 */
const permissionLevel = p => ({Manage: 0, Write: 1, Read: 2}[p.access]);

/**
 * Sort and filter permissions
 * @param permissions
 * @returns {*}
 */
const sortPermissions = (permissions) => {
    if (permissions) {
        return permissions
            .sort(comparing(compareBy(permissionLevel), compareBy('subject')));
    }
    return [];
};

/**
 * Check if collaborator can alter permission. User can alter permission if:
 * - has manage access to a collection
 * - permission is not his/hers
 * @param canManage
 * @param permission
 * @param currentLoggedUser
 * @returns {*|boolean}
 */
const canAlterPermission = (canManage, permission, currentLoggedUser) => {
    const isSomeoneElsePermission = currentLoggedUser.id !== permission.subject;
    return canManage && isSomeoneElsePermission;
};

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

    renderAlterPermissionButtons(idx, collaborator) {
        const {canManage, currentUser} = this.props;

        return canAlterPermission(canManage, collaborator, currentUser) ? (
            <ListItemSecondaryAction
                onMouseOver={e => this.props.onItemMouseOver(idx, e)}
                onMouseOut={() => this.props.onItemMouseOut(idx)}
            >
                <IconButton
                    style={{visibility: this.props.hovered !== idx ? 'hidden' : 'visible'}}
                    onClick={this.handleClick}
                >
                    <MoreIcon />
                </IconButton>
                <Menu
                    id="more-menu"
                    anchorEl={this.state.anchorEl}
                    open={Boolean(this.state.anchorEl)}
                >
                    <MenuItem
                        onClick={() => this.handleAlterPermission(collaborator)}
                    >
                        Change access
                    </MenuItem>
                    <MenuItem
                        onClick={() => this.handleRemoveCollaborator(collaborator)}
                    >
                        Delete
                    </MenuItem>
                </Menu>
            </ListItemSecondaryAction>
        ) : null;
    }

    renderCollaboratorList(permissions) {
        return sortPermissions(permissions)
            .map((p, idx) => (
                <ListItem
                    key={p.access + p.collectionId + p.subject}
                    onMouseOver={e => this.props.onItemMouseOver(idx, e)}
                    onMouseOut={() => this.props.onItemMouseOut(idx)}
                >
                    <ListItemText primary={getDisplayName(p.user)} secondary={p.access} />
                    {this.renderAlterPermissionButtons(idx, p)}
                </ListItem>
            ));
    }

    renderAddCollaboratorButton() {
        const {classes, canManage} = this.props;
        return canManage ? (
            <ListItem className={classes.buttonList}>
                <ListItemSecondaryAction>
                    <Fab
                        mini="true"
                        color="secondary"
                        aria-label="Add"
                        title="Add collaborator"
                        onClick={() => this.handleAlterPermission()}
                    >
                        <Icon>add</Icon>
                    </Fab>
                </ListItemSecondaryAction>
            </ListItem>
        ) : '';
    }

    renderUserList = (permissions) => {
        const {users} = this.props;

        // Extend the permissions map with the user itself
        const permissionsWithUsers = permissions.map(p => ({
            ...p,
            user: findById(users, p.subject)
        }));

        return (
            <List dense>
                {this.renderCollaboratorList(permissionsWithUsers)}
                {this.renderAddCollaboratorButton()}
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

export default compose(
    withStyles(styles, {withTheme: true}),
    withHovered,
)(PermissionsViewer);
