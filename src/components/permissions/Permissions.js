import React from 'react';
import permissionClient from '../../services/PermissionAPI/PermissionAPI'
import IconButton from '@material-ui/core/IconButton';
import {compareBy, comparing} from "../../utils/comparators";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ShareWithDialog from './ShareWithDialog';
import ErrorMessage from "../error/ErrorMessage";

export const AccessRights = {
    Manage: 'Manage',
    Read: 'Read',
    Write: 'Write',
    None: 'None',
};

class Permissions extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            permissions: [],
            showPermissionDialog: false,
            error: false
        };
    }

    componentDidMount() {
        if (this.props.collectionId) {
            this.loadPermissions();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.collectionId !== prevProps.collectionId) {
            this.loadPermissions();
        }
    }

    resetPermissions = () => {
        this.setState({permissions: []});
    };

    loadPermissions = () => {
        permissionClient
            .getCollectionPermissions(this.props.collectionId)
            .then(result => {
                this.setState({
                    permissions: result,
                    error: false
                });
            })
            .catch(e => {
                this.resetPermissions();
                this.setState({error: true});
                console.error('Error loading permissions', e);
            });
    };

    handleOpenPermissionDialog = () => {
        this.setState({
            showPermissionDialog: true,
        })
    };

    handleClosePermissionDialog = () => {
        this.setState({
            showPermissionDialog: false
        })
    };

    static permissionLevel(p) {
        return {Manage: 0, Write: 1, Read: 2}[p.access]
    }

    renderUserList = () => {
        const permissions = this.state.permissions
            .sort(comparing(compareBy(Permissions.permissionLevel), compareBy('subject')))
            .map((p, idx) => {
                return (
                    <TableRow key={idx}>
                        <TableCell component="th" scope="row">{p.subject}</TableCell>
                        <TableCell>{p.access}</TableCell>
                        <TableCell>
                            <IconButton aria-label="Delete" disabled>
                                <DeleteIcon/>
                            </IconButton>
                        </TableCell>
                    </TableRow>
                )
            });
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell numeric>User</TableCell>
                        <TableCell numeric>Access</TableCell>
                        <TableCell numeric>
                            <IconButton aria-label="Add" onClick={this.handleOpenPermissionDialog}>
                                <AddIcon/>
                            </IconButton>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {permissions}
                </TableBody>
            </Table>
        );
    };

    render() {
        return (
            <div>
                <Typography variant="subheading">Shared with:</Typography>
                <ShareWithDialog open={this.state.showPermissionDialog}
                                 onClose={this.handleClosePermissionDialog}/>
                {this.state.error ?
                    <ErrorMessage>message={`Error loading collaborators`}</ErrorMessage> : this.renderUserList()}

            </div>
        )
    };
}

export default Permissions
