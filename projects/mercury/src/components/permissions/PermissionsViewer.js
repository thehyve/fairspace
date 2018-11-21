import React from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import ErrorMessage from "../error/ErrorMessage";
import {withStyles} from "@material-ui/core/styles/index";
import ConfirmationDialog from "../generic/ConfirmationDialog/ConfirmationDialog";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import AlterPermission from "../../containers/AlterPermissionContainer/AlterPermissionContainer";
import {compareBy, comparing} from "../../utils/comparators";
import ErrorDialog from "../error/ErrorDialog";
import {getDisplayName} from "../../utils/userUtils";
import MoreActions from "../generic/MoreActions/MoreActions";
import ActionItem from "../generic/MoreActions/ActionItem";
import withHovered from "../../containers/WithHovered/WithHovered";
import {compose} from "redux";
import {findById} from "../../utils/arrayutils";
import LoadingInlay from '../generic/Loading/LoadingInlay';

export const styles = theme => ({
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
            selectedUser: null,
            currentLoggedUser: null,
            canManage: false,
            deletingCollaborator: false
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
            selectedUser: user
        })
    };

    handleShareWithDialogClose = () => {
        this.setState({
            showPermissionDialog: false,
            selectedUser: null,
        })
    };

    handleDeleteCollaborator = () => {
        const {collectionId, alterPermission} = this.props;
        const {selectedUser} = this.state;
        this.setState({deletingCollaborator: true});
        if (selectedUser) {
            alterPermission(selectedUser.subject, collectionId, 'None')
                .then(() => {
                    this.setState({deletingCollaborator: false});
                });
            this.handleCloseConfirmDeleteDialog();
        }
    };

    handleRemoveCollaborator = (collaborator) => {
        this.setState({
            selectedUser: collaborator,
            showConfirmDeleteDialog: true
        });
    };

    handleCloseConfirmDeleteDialog = () => {
        this.setState({
            showConfirmDeleteDialog: false,
        });
    };

    renderAlterPermissionButtons(idx, collaborator) {
        const {canManage, currentLoggedUser} = this.props;
        return canAlterPermission(canManage, collaborator, currentLoggedUser) ? (
            <ListItemSecondaryAction
                onMouseOver={(e) => this.props.onItemMouseOver(idx, e)}
                onMouseOut={() => this.props.onItemMouseOut(idx)}
            >
                <MoreActions visibility={this.props.hovered !== idx ? 'hidden' : 'visible'}>
                    <ActionItem onClick={() => this.handleAlterPermission(collaborator)}>
                        Change access
                    </ActionItem>
                    <ActionItem onClick={() => this.handleRemoveCollaborator(collaborator)}>Delete</ActionItem>
                </MoreActions>
            </ListItemSecondaryAction>
        ) : '';
    }

    renderCollaboratorList(permissions) {
        return sortPermissions(permissions)
            .map((p, idx) => {
                return (
                    <ListItem
                        key={idx}
                        onMouseOver={(e) => this.props.onItemMouseOver(idx, e)}
                        onMouseOut={() => this.props.onItemMouseOut(idx)}>
                        <ListItemText primary={getDisplayName(p.user)} secondary={p.access}/>
                        {this.renderAlterPermissionButtons(idx, p)}
                    </ListItem>
                );
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
        const {users} = this.props;
        permissions.map(p => p.user = findById(users, p.subject));
        return (
            <List dense>
                {this.renderCollaboratorList(permissions)}
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
        const fullName = selectedUser && getDisplayName(selectedUser.user);
        const content = `Are you sure you want to remove "${fullName}" from the collaborator list?`;
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

    renderLoadingOnCollaboratorDeletion = () => {
        return this.state.deletingCollaborator ? <LoadingInlay/> : null;
    }

    render() {
        const {classes, permissions} = this.props;
        if (permissions.error) {
            return (<ErrorMessage message={'An error occurred loading permissions'}/>)
        } else if (permissions.pending) {
            return (<LoadingInlay/>);
        } else if (!permissions || !permissions.data) {
            return (<div>No permission found</div>)
        } else {
            return (
                <div className={classes.collaboratorList}>
                    {this.renderPermissionDialog()}
                    {this.renderConfirmationDialog()}
                    {this.renderUserList(permissions.data)}
                    {this.renderLoadingOnCollaboratorDeletion()}
                </div>
            );
        }
    };
}

export default compose(
    withStyles(styles, {withTheme: true}),
    withHovered,
)(PermissionsViewer);
