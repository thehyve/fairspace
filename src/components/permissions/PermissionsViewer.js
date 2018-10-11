import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add';
import ErrorMessage from "../error/ErrorMessage";
import {withStyles} from "@material-ui/core/styles/index";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmationDialog from "../generic/ConfirmationDialog/ConfirmationDialog";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import AlterPermission from "./AlterPermissionContainer";
import {compareBy, comparing} from "../../utils/comparators";
import ErrorDialog from "../error/ErrorDialog";
import {getDisplayName} from "../collections/utils/userUtils";

export const styles = theme => ({
    root: {},
    collaboratorIcon: {
        visibility: "hidden",
        "&:hover": {
            visibility: "inherit"
        }
    },
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
const permissionLevel = (p) => {
    return {Manage: 0, Write: 1, Read: 2}[p.access]
};

/**
 * Sort and filter permissions
 * @param permissions
 * @returns {*}
 */
const sortPermissions = (permissions) => {
    if (permissions) {
        return permissions
            .sort(comparing(compareBy(permissionLevel), compareBy('subject')));
    } else {
        return [];
    }
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
            error: false,
            hovered: null,
            anchorEl: null,
            selectedUser: null,
            currentLoggedUser: null,
            canManage: false,
        };
    }

    componentDidMount() {
        const {collectionId, fetchPermissions} = this.props;
        if (collectionId) {
            fetchPermissions(collectionId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {collectionId, alteredPermission, fetchPermissions} = this.props;
        if (collectionId && (collectionId !== prevProps.collectionId)) {
            fetchPermissions(collectionId);
        }
        if (alteredPermission.data !== prevProps.alteredPermission.data) {
            fetchPermissions(collectionId, true);
        } else if (prevProps.alteredPermission !== alteredPermission && alteredPermission.error) {
            const {alteredPermission} = this.props;
            if (prevProps.alteredPermission !== alteredPermission && alteredPermission.error) {
                ErrorDialog.showError(true, 'An error occurred while altering the permission.');
            }
        }
    }

    handleAlterPermission = (user) => {
        this.setState({
            showPermissionDialog: true,
            anchorEl: null,
            selectedUser: user
        })
    };

    handleShareWithDialogClose = () => {
        this.setState({
            showPermissionDialog: false,
            selectedUser: null,
        })
    };

    handleMoreClick = (user, event) => {
        this.setState({
            anchorEl: event.currentTarget,
            selectedUser: user,
        });
    };

    handleMoreClose = () => {
        this.setState({anchorEl: null});
    };

    handleDeleteCollaborator = () => {
        const {selectedUser} = this.state;
        const {collectionId, alterPermission} = this.props;
        if (selectedUser) {
            alterPermission(selectedUser.subject, collectionId, 'None');
            this.handleCloseConfirmDeleteDialog();
        }
    };

    handleRemoveCollaborator = () => {
        this.setState({
            anchorEl: null,
            showConfirmDeleteDialog: true
        });
    };

    handleCloseConfirmDeleteDialog = () => {
        this.setState({
            showConfirmDeleteDialog: false,
        });
    };

    handleListItemMouseover = (value) => {
        this.setState({
            hovered: value
        })
    };

    handleListItemMouseout = (value) => {
        if (this.state.hovered === value) {
            this.setState({hovered: null})
        }
    };

    renderAlterPermissionButtons(idx, collaborator) {
        const {classes, canManage, currentLoggedUser} = this.props;
        const {hovered} = this.state;
        const secondaryActionClassName = hovered !== idx ? classes.collaboratorIcon : null;
        return canAlterPermission(canManage, collaborator, currentLoggedUser) ? (
            <ListItemSecondaryAction
                onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                onMouseOut={() => this.handleListItemMouseout(idx)}
            >
                <IconButton aria-label="Alter Permission" className={secondaryActionClassName}
                            onClick={(e) => this.handleMoreClick(collaborator, e)}>
                    <MoreIcon/>
                </IconButton>
            </ListItemSecondaryAction>
        ) : '';
    }

    renderCollaboratorList(permissions) {
        const {canManage, currentLoggedUser} = this.props;
        return sortPermissions(permissions)
            .map((p, idx) => {
                return (<ListItem
                    key={idx}
                    button={canAlterPermission(canManage, p, currentLoggedUser)}
                    onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                    onMouseOut={() => this.handleListItemMouseout(idx)}
                >
                    <ListItemText primary={getDisplayName(p)} secondary={p.access}/>
                    {this.renderAlterPermissionButtons(idx, p)}
                </ListItem>);
            });
    }

    renderAddCollaboratorButton() {
        const {classes, canManage} = this.props;
        return canManage ? (
            <ListItem className={classes.buttonList}>
                <ListItemSecondaryAction>
                    <Button variant='fab' aria-label="Add" onClick={() => this.handleAlterPermission()} mini>
                        <AddIcon/>
                    </Button>
                </ListItemSecondaryAction>
            </ListItem>
        ) : '';
    }

    renderUserList = (permissions) => {
        const {anchorEl, selectedUser} = this.state;
        return (
            <List dense>
                {this.renderCollaboratorList(permissions)}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleMoreClose}>
                    <MenuItem onClick={() => this.handleAlterPermission(selectedUser)}>Change access</MenuItem>
                    <MenuItem onClick={this.handleRemoveCollaborator}>Delete</MenuItem>
                </Menu>
                {this.renderAddCollaboratorButton()}
            </List>
        );
    };

    renderPermissionDialog = () => {
        const {collectionId, currentLoggedUser} = this.props;
        const {selectedUser, showPermissionDialog} = this.state;
        return (
            <AlterPermission open={showPermissionDialog}
                             onClose={this.handleShareWithDialogClose}
                             user={selectedUser}
                             collectionId={collectionId}
                             currentLoggedUser={currentLoggedUser}/>
        );
    };

    renderConfirmationDialog = () => {
        const {selectedUser, showConfirmDeleteDialog} = this.state;
        const userText = selectedUser ? getDisplayName(selectedUser) : 'this user';
        const content = `Are you sure you want to remove "${userText}" as collaborator?`;
        return (
            <ConfirmationDialog open={showConfirmDeleteDialog}
                                title={'Confirmation'}
                                content={content}
                                onAgree={this.handleDeleteCollaborator}
                                onDisagree={this.handleCloseConfirmDeleteDialog}
                                onClose={this.handleCloseConfirmDeleteDialog}
            />
        );
    };

    render() {
        const {classes, permissions, } = this.props;
        if (permissions.error) {
            return (<ErrorMessage>message={`Error loading permissions`}</ErrorMessage>)
        } else if (permissions.pending) {
            return (<CircularProgress/>);
        } else if (!permissions || !permissions.data) {
            return (<div>No permission found</div>)
        } else {
            return (
                <div className={classes.collaboratorList}>
                    {this.renderPermissionDialog()}
                    {this.renderConfirmationDialog()}
                    {this.renderUserList(permissions.data)}
                </div>
            );
        }
    };
}

export default withStyles(styles, {withTheme: true})(PermissionsViewer);
