import React from 'react';
import permissionAPI from '../../services/PermissionAPI/PermissionAPI'
import {connect} from 'react-redux';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {compareBy, comparing} from "../../utils/comparators";
import MoreIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add';
import ShareWithDialog from './ShareWithDialog';
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

export const AccessRights = {
    Read: 'Read',
    Write: 'Write',
    Manage: 'Manage',
};

const styles = theme => ({
    root: {},
    collaboratorIcon: {
        visibility: "hidden",
        "&:hover": {
            visibility: "inherit"
        }
    },
    collaboratorIcon: {
        visibility: "hidden"
    },
    collaboratorList: {
        width: '100%'
    },
    buttonList : {
        marginTop: '10px'
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing.unit * 2,
        right: theme.spacing.unit * 2,
    },
});

class Permissions extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            permissions: [],
            showPermissionDialog: false,
            showConfirmDeleteDialog: false,
            error: false,
            hovered: null,
            anchorEl: null,
            selectedUser: null,
            currentUser: null
        };
    }

    componentDidMount() {
        if (this.props.collectionId) {
            this.loadPermissions();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {collectionId} = this.props;
        if (collectionId !== prevProps.collectionId) {
            this.loadPermissions();
        }
    }

    resetPermissions = () => {
        this.setState({permissions: []});
    };

    loadPermissions = () => {
        const {creator} = this.props;
        console.log(this.props);
        permissionAPI
            .getCollectionPermissions(this.props.collectionId)
            .then(result => {
                this.setState({
                    permissions: result.filter(item => item.subject !== creator),
                    error: false
                });
            })
            .catch(e => {
                this.resetPermissions();
                this.setState({error: true});
            });
    };

    handleAlterPermission = () => {
        this.setState({
            showPermissionDialog: true,
            anchorEl: null,
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
        if (selectedUser) {
            this.handleCloseConfirmDeleteDialog();
            permissionAPI
                .removeUserFromCollectionPermission(selectedUser.subject, this.state.collectionId)
                .then(() => {
                    this.loadPermissions(); // reload permissions
                })
                .catch(error => {
                    ErrorDialog.showError(error, 'An error occurred while altering the permission.');
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

    renderCollaboratorList(collaborators) {
        const {classes} = this.props;
        const {hovered} = this.state;

        return collaborators
            .sort(comparing(compareBy(Permissions.permissionLevel), compareBy('subject')))
            .map((p, idx) => {
                const secondaryActionClassName = hovered !== idx ? classes.collaboratorIcon : null;
                return (<ListItem
                    key={idx}
                    button
                    onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                    onMouseOut={() => this.handleListItemMouseout(idx)}
                >
                    <ListItemText primary={p.subject} secondary={p.access}/>
                    <ListItemSecondaryAction
                        onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                        onMouseOut={() => this.handleListItemMouseout(idx)}
                    >
                        <IconButton aria-label="Delete" className={secondaryActionClassName}
                                    onClick={(e) => this.handleMoreClick(p, e)}>
                            <MoreIcon/>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>);
            });
    }

    renderUserList = () => {
        const {permissions, anchorEl} = this.state;
        const {classes} = this.props;
        return (
            <List dense>
                {this.renderCollaboratorList(permissions)}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleMoreClose}>
                    <MenuItem onClick={this.handleAlterPermission}>Change access</MenuItem>
                    <MenuItem onClick={this.handleRemoveCollaborator}>Delete</MenuItem>
                </Menu>
                <ListItem className={classes.buttonList}>
                    <ListItemSecondaryAction>
                        <Button variant='fab' aria-label="Add" onClick={this.handleAlterPermission} mini>
                            <AddIcon/>
                        </Button>
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
        );
    };

    render() {
        const {classes} = this.props;
        const {selectedUser} = this.state;
        return (
            <div className={classes.collaboratorList}>
                <ShareWithDialog open={this.state.showPermissionDialog}
                                 onClose={this.handleShareWithDialogClose}
                                 user={this.state.selectedUser}
                                 collectionId={this.props.collectionId}
                />
                <ConfirmationDialog open={this.state.showConfirmDeleteDialog}
                                    title={'Confirmation'}
                                    content={`Are you sure you want to remove ${selectedUser ? selectedUser.subject : 'user'} as collaborator?`}
                                    onAgree={this.handleDeleteCollaborator}
                                    onDisagree={this.handleCloseConfirmDeleteDialog}
                                    onClose={this.handleCloseConfirmDeleteDialog}
                />
                {this.state.error ?
                    <ErrorMessage>message={`Error loading collaborators`}</ErrorMessage> : this.renderUserList()}
            </div>
        )
    };
}

const mapStateToProps = ({account: {user}}) => {
    return {
        currentUser: user.item
    }
};

export default connect(mapStateToProps)(withStyles(styles, {withTheme: true})(Permissions));
