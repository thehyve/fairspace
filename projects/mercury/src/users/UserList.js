import React, {useContext, useState} from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
} from "@material-ui/core";

import IconButton from "@material-ui/core/IconButton";
import {HighlightOffSharp} from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {ConfirmationButton, usePagination, UsersContext, useSorting} from '../common';
import UserSelect from "../permissions/UserSelect";
import {UserContext} from "../common/contexts";
import PermissionContext, {PermissionProvider} from "../common/contexts/PermissionContext";
import PermissionAPI from "../permissions/PermissionAPI";

const columns = {
    name: {
        valueExtractor: 'name',
        label: 'Name'
    },
    email: {
        valueExtractor: 'email',
        label: 'Email'
    },
    access: {
        valueExtractor: 'access',
        label: 'Access'
    }
};

const UserList = (props) => {
    const {collaborators, users, currentUser, workspace, refresh: refreshUsers} = props;
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(collaborators, columns, 'name');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);
    const canManage = currentUser.admin || workspace.canManage;
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [userToAdd, setUserToAdd] = useState(null);
    const [altering, setAltering] = useState(false);

    const grantUserAccess = (userIri, access) => {
        setAltering(true);
        return PermissionAPI
            .alterPermission(userIri, workspace.iri, access)
            .then(() => {
                refreshUsers();
                // refreshPermissions();
            })
            .catch(e => {
                console.error("Error altering permission", e);
            })
            .finally(() => setAltering(false));
    };

    const renderAddUserDialog = () => (
        <Dialog
            open={showAddUserDialog}
            onClose={() => setShowAddUserDialog(false)}
        >
            <DialogTitle id="scroll-dialog-title">Add user to the workspace</DialogTitle>
            <DialogContent>
                <UserSelect
                    autoFocus
                    filter={u => u.iri !== currentUser.iri && collaborators.find(c => c.user === u.iri) === undefined}
                    onChange={setUserToAdd}
                    placeholder="Please select a user"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setShowAddUserDialog(false);
                        grantUserAccess(userToAdd.iri, 'Read');
                    }}
                    color="primary"
                    disabled={!userToAdd}
                >
                    Add
                </Button>
                <Button
                    onClick={() => setShowAddUserDialog(false)}
                    color="default"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );

    const renderAddUserButton = () => (
        <Button
            style={{marginTop: 8}}
            color="primary"
            variant="contained"
            aria-label="Add"
            title="Add user to workspace"
            onClick={() => {
                setUserToAdd(undefined);
                setShowAddUserDialog(true);
            }}
        >
            Add user
        </Button>
    );

    const renderUserList = () => (
        <Paper style={{marginTop: 16}}>
            <Table>
                <TableHead>
                    <TableRow>
                        {
                            Object.entries(columns).map(([key, column]) => (
                                <TableCell key={key}>
                                    <TableSortLabel
                                        active={orderBy === key}
                                        direction={orderAscending ? 'asc' : 'desc'}
                                        onClick={() => toggleSort(key)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))
                        }
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pagedItems.map((u) => (
                        <TableRow
                            key={u.user}
                            hover
                        >
                            <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                {u.name}
                            </TableCell>
                            <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                {u.email}
                            </TableCell>
                            <TableCell style={{width: 120}}>
                                <Select
                                    value={u.access}
                                    disabled={!canManage}
                                    onChange={e => grantUserAccess(u.user, e.target.value)}
                                    disableUnderline
                                >
                                    {['Read', 'Write', 'Manage'].map(permission => (
                                        <MenuItem value={permission}>{permission}</MenuItem>
                                    ))}
                                </Select>
                            </TableCell>
                            <TableCell style={{width: 32}}>
                                <ConfirmationButton
                                    onClick={() => grantUserAccess(u.user, 'None')}
                                    disabled={!canManage}
                                    message="Are you sure you want to remove this user from the workspace?"
                                    agreeButtonText="Remove user"
                                    dangerous
                                >
                                    <IconButton disabled={!canManage}>
                                        <HighlightOffSharp />
                                    </IconButton>
                                </ConfirmationButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={collaborators.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={(e, p) => setPage(p)}
                onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
            />
        </Paper>
    );

    return (
        <>
            {renderUserList()}
            {canManage ? renderAddUserButton() : ''}
            {renderAddUserDialog()}
        </>
    );
};

const ContextualUserList = (props) => {
    const {workspace, workspacesError, workspacesLoading} = props;
    const {currentUser} = useContext(UserContext);
    const {users, refresh, loadingUsers, errorUsers} = useContext(UsersContext);

    return (
        <PermissionProvider iri={workspace.iri}>
            <PermissionContext.Consumer>
                {({permissions}) => (
                    <UserList
                        collaborators={permissions}
                        users={users}
                        currentUser={currentUser}
                        workspace={workspace}
                        refresh={refresh}
                    />
                )}
            </PermissionContext.Consumer>
        </PermissionProvider>
    );
};

export default ContextualUserList;
