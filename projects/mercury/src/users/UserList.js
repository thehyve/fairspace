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
import type {User} from './UsersAPI';
import {ConfirmationButton, usePagination, UsersContext, useSorting} from '../common';
import UserSelect from "../permissions/UserSelect";
import WorkspaceUserContext from "../common/contexts/WorkspaceUserContext";
import {grantUserRole} from "./UsersAPI";
import {isCoordinator} from "../common/utils/userUtils";

const checkRole = (role: string) => (user: User) => user.role === role;

const columns = {
    name: {
        valueExtractor: 'name',
        label: 'Name'
    },
    email: {
        valueExtractor: 'email',
        label: 'Email'
    },
    role: {
        valueExtractor: 'role',
        label: 'Role'
    }
};

const toggleRole = (user: User, role: string) => (checkRole(role)(user) ? grantUserRole(user, 'none') : grantUserRole(user, role));

const UserList = () => {
    const {workspaceUser} = useContext(WorkspaceUserContext);
    const {users, refresh} = useContext(UsersContext);
    const workspaceUsers = users.filter(u => !!u.role);
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(workspaceUsers, columns, 'name');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);
    const canManage = workspaceUser.admin || isCoordinator(workspaceUser);
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [userToAdd, setUserToAdd] = useState(null);

    return (
        <>
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
                        {pagedItems.map((user: User) => (
                            <TableRow
                                key={user.iri}
                                hover
                            >
                                <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                    {user.name}
                                </TableCell>
                                <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                    {user.email}
                                </TableCell>
                                <TableCell style={{width: 120}}>
                                    <Select
                                        value={user.role}
                                        disabled={!canManage}
                                        onChange={e => toggleRole(user, e.target.value).then(refresh)}
                                        disableUnderline
                                    >
                                        { ['user', 'write', 'datasteward', 'coordinator'].map(role => (<MenuItem value={role}>{role}</MenuItem>))}
                                    </Select>
                                </TableCell>
                                <TableCell style={{width: 32}}>
                                    <ConfirmationButton
                                        onClick={() => grantUserRole(user, 'none').then(refresh)}
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
                    count={workspaceUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={(e, p) => setPage(p)}
                    onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
                />
            </Paper>
            {
                canManage
                    ? (
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
                    )
                    : ''
            }
            <Dialog
                open={showAddUserDialog}
                onClose={() => setShowAddUserDialog(false)}
            >
                <DialogTitle id="scroll-dialog-title">Add user to the workspace</DialogTitle>
                <DialogContent>
                    <UserSelect
                        autoFocus
                        filter={user => !user.role}
                        onChange={setUserToAdd}
                        placeholder="Please select a user"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowAddUserDialog(false);
                            grantUserRole(userToAdd, 'user').then(refresh);
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
        </>
    );
};

export default UserList;
