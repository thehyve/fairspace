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
import PermissionChecker from "./PermissionChecker";
import AlterPermission from "./AlterPermissionContainer";
import {compareBy} from "../../utils/comparators";

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
 * @param creator
 * @returns {*}
 */
const sortAndFilterPermissions = (permissions, creator) => {
    if (permissions && permissions.data) {
        return permissions.data
            .filter(item => item.subject !== creator)
            .sort(comparing(compareBy(permissionLevel), compareBy('subject')));
    } else {
        return [];
    }
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
        const {collection, fetchPermissions} = this.props;
        if (collection) {
            this.setState({
                canManage: PermissionChecker.canManage(collection)
            });
            fetchPermissions(collection.id);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {collection, alteredPermission, fetchPermissions} = this.props;
        if (collection.id !== prevProps.collection.id) {
            this.setState({
                canManage: PermissionChecker.canManage(collection)
            });
            fetchPermissions(collection.id);
        }
        if (alteredPermission.data !== prevProps.alteredPermission.data) {
            fetchPermissions(collection.id);
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
        const {collection, alterPermission} = this.props;
        if (selectedUser) {
            alterPermission(selectedUser.subject, collection.id, 'None');
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
        const {classes} = this.props;
        const {hovered, canManage} = this.state;
        const secondaryActionClassName = hovered !== idx ? classes.collaboratorIcon : null;
        return canManage ? (
            <ListItemSecondaryAction
                onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                onMouseOut={() => this.handleListItemMouseout(idx)}
            >
                {null}
                <IconButton aria-label="Delete" className={secondaryActionClassName}
                            onClick={(e) => this.handleMoreClick(collaborator, e)}>
                    <MoreIcon/>
                </IconButton>
            </ListItemSecondaryAction>
        ) : '';
    }

    renderCollaboratorList() {
        const {collection:{creator}, permissions} = this.props;
        return sortAndFilterPermissions(permissions, creator)
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
