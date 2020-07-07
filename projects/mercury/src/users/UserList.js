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
import Checkbox from "@material-ui/core/Checkbox";
import UserSelect from "../permissions/UserSelect";
import PermissionContext, {PermissionProvider} from "../permissions/PermissionContext";
import LoadingOverlay from "../common/components/LoadingOverlay";
import {canAlterPermission} from "../permissions/permissionUtils";
import type {Workspace} from "../workspaces/WorkspacesAPI";
import type {User, UserRoles} from "./UsersAPI";
import UserContext from "./UserContext";
import UsersContext from "./UsersContext";
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";
import ConfirmationButton from "../common/components/ConfirmationButton";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";

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
        label: 'Can manage?'
    }
};

type UserListProps = {
    currentUser: User & UserRoles,
    workspace: Workspace
}

const UserList = (props: UserListProps) => {
    const {currentUser, workspace} = props;
    const {canManage} = workspace;
    const {
        permissions: collaborators, alterPermission, altering,
        loading: loadingPermissions, error: errorPermissions
    } = useContext(PermissionContext);
    const {users} = useContext(UsersContext);
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(collaborators, columns, 'name');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [userToAdd, setUserToAdd] = useState(null);

    if (errorPermissions) {
        return (<MessageDisplay message="An error occurred loading permissions" />);
    } if (loadingPermissions) {
        return (<LoadingInlay />);
    } if (altering) {
        return (<LoadingOverlay loading />);
    }

    const grantUserAccess = (userIri, access) => (
        alterPermission(userIri, workspace.iri, access)
    );

    const renderAddUserDialog = () => (
        <Dialog
            open={showAddUserDialog}
            onClose={() => setShowAddUserDialog(false)}
        >
            <DialogTitle id="scroll-dialog-title">Add user to the workspace</DialogTitle>
            <DialogContent>
                <UserSelect
                    autoFocus
                    users={users}
                    filter={u => u.iri !== currentUser.iri && collaborators.find(c => c.user === u.iri) === undefined}
                    onChange={setUserToAdd}
                    placeholder="Please select a user"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setShowAddUserDialog(false);
                        grantUserAccess(userToAdd.iri, 'Write');
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
                                <Checkbox
                                    checked={u.canManage}
                                    onChange={(event) => (
                                        event.target.checked
                                            ? grantUserAccess(u.user, "Manage")
                                            : grantUserAccess(u.user, "Write")
                                    )}
                                    disabled={!canAlterPermission(canManage, u, currentUser)}
                                    disableRipple
                                />
                            </TableCell>
                            <TableCell style={{width: 32}}>
                                <ConfirmationButton
                                    onClick={() => grantUserAccess(u.user, 'None')}
                                    disabled={!canAlterPermission(canManage, u, currentUser)}
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

const UserListWithPermissionProvider = (props) => {
    const {workspace} = props;
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {usersLoading, usersError} = useContext(UsersContext);

    if (currentUserError || usersError) {
        return (<MessageDisplay message="An error occurred loading users" />);
    } if (currentUserLoading || usersLoading) {
        return (<LoadingInlay />);
    }

    return (
        <PermissionProvider iri={workspace.iri}>
            <UserList
                currentUser={currentUser}
                workspace={workspace}
            />
        </PermissionProvider>
    );
};

export default UserListWithPermissionProvider;
