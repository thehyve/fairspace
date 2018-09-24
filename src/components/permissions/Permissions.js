import React from 'react';
import permissionAPI from '../../services/PermissionAPI/PermissionAPI'
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import {compareBy, comparing} from "../../utils/comparators";
import Typography from "@material-ui/core/Typography";
import MoreIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ShareWithDialog from './ShareWithDialog';
import ErrorMessage from "../error/ErrorMessage";
import {withStyles} from "@material-ui/core/styles/index";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmationDialog from "../generic/ConfirmationDialog/ConfirmationDialog";
import ErrorDialog from "../error/ErrorDialog";

export const AccessRights = {
    Read: 'Read',
    Write: 'Write',
    Manage: 'Manage',
};

const styles = theme => ({
    root: {},
    collabolatorIcon: {
        visibility: "hidden",
        "&:hover": {
            visibility: "inherit"
        }
    },
    collabolatorIcon: {
        visibility: "hidden"
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

    renderCollaboratorList = (collaborators) => {
        const {classes} = this.props;
        const {hovered} = this.state;

        return collaborators
            .sort(comparing(compareBy(Permissions.permissionLevel), compareBy('subject')))
            .map((p, idx) => {
                const secondaryActionClassName = hovered !== idx ? classes.collabolatorIcon : null;
                return (
                    <TableRow key={idx} hover className={classes.userList}
                              onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                              onMouseOut={() => this.handleListItemMouseout(idx)}>
                        <TableCell component="th" scope="row">{p.subject}</TableCell>
                        <TableCell>{p.access}</TableCell>
                        <TableCell>
                            <IconButton aria-label="Delete" className={secondaryActionClassName}
                                        onClick={(e) => this.handleMoreClick(p, e)}>
                                <MoreIcon/>
                            </IconButton>
                        </TableCell>
                    </TableRow>
                )
            });
    };

    renderUserList = () => {
        const {permissions, anchorEl} = this.state;
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell numeric>User</TableCell>
                        <TableCell numeric>Access</TableCell>
                        <TableCell numeric>
                            <IconButton aria-label="Add" onClick={this.handleAlterPermission}>
                                <AddIcon/>
                            </IconButton>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.renderCollaboratorList(permissions)}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={this.handleMoreClose}>
                        <MenuItem onClick={this.handleAlterPermission}>Change access</MenuItem>
                        <MenuItem onClick={this.handleRemoveCollaborator}>Delete</MenuItem>
                    </Menu>
                </TableBody>
            </Table>
        );
    };

    render() {
        const {selectedUser} = this.state;
        return (
            <div>
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

const mapStateToProps = ({account: { user }}) => {
    return {
        currentUser: user.item
    }
};

export default connect(mapStateToProps)(withStyles(styles, {withTheme: true})(Permissions));
