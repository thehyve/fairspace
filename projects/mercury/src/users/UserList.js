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
import {canAlterPermission} from "../permissions/permissionUtils";
import type {Workspace} from "../workspaces/WorkspacesAPI";
import type {User, UserRoles} from "./UsersAPI";
import UsersContext from "./UsersContext";
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";
import ConfirmationButton from "../common/components/ConfirmationButton";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import WorkspaceUsersContext, {WorkspaceUsersProvider} from "../workspaces/WorkspaceUsersContext";
import UserContext from "./UserContext";
import {getWorkspaceUsersWithRoles} from "./userUtils";
import ErrorDialog from "../common/components/ErrorDialog";

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
        label: 'Manager'
    }
};

type UserListProps = {
    currentUser: User & UserRoles,
    workspace: Workspace,
    workspaceUsers: Object,
    workspaceUsersError: boolean,
    workspaceUsersLoading: boolean,
    setWorkspaceRole: () => {}
}

const UserList = (props: UserListProps) => {
    const {currentUser, workspace, workspaceUsers, workspaceUsersError, workspaceUsersLoading, setWorkspaceRole} = props;
    const {canManage} = workspace;
    const {users} = useContext(UsersContext);
    const workspaceUsersWithRoles = getWorkspaceUsersWithRoles(users, workspaceUsers);
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(workspaceUsersWithRoles, columns, 'name');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [userToAdd, setUserToAdd] = useState(null);

    if (workspaceUsersError) {
        return (<MessageDisplay message="An error occurred loading permissions" />);
    } if (workspaceUsersLoading) {
        return (<LoadingInlay />);
    }

    const grantUserRole = (userIri, role) => {
        setWorkspaceRole(userIri, role)
            .catch(err => {
                const message = err && err.message ? err.message : "An error occurred while updating a workspace users";
                ErrorDialog.showError(err, message);
            })
            .finally(() => setShowAddUserDialog(false));
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
                    users={users}
                    filter={u => u.iri !== currentUser.iri && workspaceUsersWithRoles.find(c => c.iri === u.iri) === undefined}
                    onChange={setUserToAdd}
                    placeholder="Please select a user"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => grantUserRole(userToAdd.iri, 'Member')}
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
                                    checked={u.role === 'Manager'}
                                    onChange={(event) => (
                                        event.target.checked
                                            ? grantUserRole(u.user, "Manager")
                                            : grantUserRole(u.user, "Member")
                                    )}
                                    disabled={!canAlterPermission(canManage, u, currentUser)}
                                    disableRipple
                                />
                            </TableCell>
                            <TableCell style={{width: 32}}>
                                <ConfirmationButton
                                    onClick={() => grantUserRole(u.iri, 'None')}
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
                count={workspaceUsersWithRoles.length}
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
    const {workspace} = props;
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {usersLoading, usersError} = useContext(UsersContext);

    if (currentUserError || usersError) {
        return (<MessageDisplay message="An error occurred loading users" />);
    } if (currentUserLoading || usersLoading) {
        return (<LoadingInlay />);
    }

    return (
        <WorkspaceUsersProvider iri={workspace.iri}>
            <WorkspaceUsersContext.Consumer>
                {({workspaceUsers, workspaceUsersError, workspaceUsersLoading, setWorkspaceRole}) => (
                    <UserList
                        currentUser={currentUser}
                        workspace={workspace}
                        workspaceUsers={workspaceUsers}
                        workspaceUsersError={workspaceUsersError}
                        workspaceUsersLoading={workspaceUsersLoading}
                        setWorkspaceRole={setWorkspaceRole}
                    />
                )}
            </WorkspaceUsersContext.Consumer>
        </WorkspaceUsersProvider>
    );
};

export default ContextualUserList;
