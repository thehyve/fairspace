import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {compareBy, comparing} from "../../utils/comparators";
import MoreIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add';
import ErrorMessage from "../error/ErrorMessage";
import {withStyles} from "@material-ui/core/styles/index";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmationDialog from "../generic/ConfirmationDialog/ConfirmationDialog";
import ErrorDialog from "../error/ErrorDialog";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import PermissionChecker from "./PermissionChecker";
import Permissions from "./Permissions";
import AlterPermission from "./AlterPermission";

const styles = theme => ({
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

class PermissionsViewer extends React.Component {

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
        const {collection} = this.props;
        if (collection) {
            this.loadPermissions();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {collection} = this.props;
        if (collection.id !== prevProps.collection.id) {
            this.loadPermissions();
        }
    }

    loadPermissions = () => {
        const {collection, onFetchPermissions} = this.props;
        this.setState({
            canManage: PermissionChecker.canManage(collection)
        });
        onFetchPermissions(collection.id);
    };

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
        const {collection, onAlterPermission, alterPermission} = this.props;
        if (selectedUser) {
            onAlterPermission(selectedUser.subject, collection.id, 'None').then(d => {
                if (alterPermission.error) {
                    this.handleCloseConfirmDeleteDialog();
                    ErrorDialog.showError(alterPermission.error, 'An error occurred while altering the permission.');
                } else if (alterPermission.pending) {
                    console.log('Pending alter permission')
                } else if (alterPermission.data) {
                    console.log('success', alterPermission.data);
                    this.handleCloseConfirmDeleteDialog();
                }
            });
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

    static permissionLevel(p) {
        return {Manage: 0, Write: 1, Read: 2}[p.access]
    }

    handleListItemMouseover = (value, event) => {
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
        const {classes} = this.props;
        const {hovered, canManage} = this.state;
        const secondaryActionClassName = hovered !== idx ? classes.collaboratorIcon : null;
        return canManage ? (
            <ListItemSecondaryAction
                onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                onMouseOut={() => this.handleListItemMouseout(idx)}
            >
                <IconButton aria-label="Delete" className={secondaryActionClassName}
                            onClick={(e) => this.handleMoreClick(collaborator, e)}>
                    <MoreIcon/>
                </IconButton>
            </ListItemSecondaryAction>
        ) : '';
    }

    renderCollaboratorList(permissions) {
        let filteredPermissions = permissions.filter(item => item.subject !== this.props.collection.creator);
        return filteredPermissions
            .sort(comparing(compareBy(Permissions.permissionLevel), compareBy('subject')))
            .map((p, idx) => {
                return (<ListItem
                    key={idx}
                    button
                    onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                    onMouseOut={() => this.handleListItemMouseout(idx)}
                >
                    <ListItemText primary={p.subject} secondary={p.access}/>
                    {this.renderAlterPermissionButtons(idx, p)}
                </ListItem>);
            });
    }

    renderAddCollaboratorButton() {
        const {classes} = this.props;
        const {canManage} = this.state;
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

    render() {
        const {classes, collection, permissions, currentLoggedUser} = this.props;
        const {selectedUser, showPermissionDialog, showConfirmDeleteDialog} = this.state;

        if (permissions.error) {
            return (<ErrorMessage>message={`Error loading permissions`}</ErrorMessage>)
        } else if (permissions.pending) {
            return (<CircularProgress/>);
        } else if (!permissions || !permissions.data) {
            return (<div>No permission found</div>)
        } else {
            return (
                <div className={classes.collaboratorList}>
                    <AlterPermission open={showPermissionDialog}
                                     onClose={this.handleShareWithDialogClose}
                                     user={selectedUser}
                                     collection={collection}
                                     collaborators={permissions.data}
                                     currentLoggedUser={currentLoggedUser}
                    />
                    <ConfirmationDialog open={showConfirmDeleteDialog}
                                        title={'Confirmation'}
                                        content={`Are you sure you want to remove ${selectedUser ? selectedUser.subject : 'user'} as collaborator?`}
                                        onAgree={this.handleDeleteCollaborator}
                                        onDisagree={this.handleCloseConfirmDeleteDialog}
                                        onClose={this.handleCloseConfirmDeleteDialog}
                    />
                    {this.renderUserList(permissions.data)}
                </div>
            );
        }
    };
}

export default withStyles(styles, {withTheme: true})(PermissionsViewer);
