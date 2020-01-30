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

import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import {Delete} from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import LinkedDataContext from "../metadata/LinkedDataContext";
import {addUser} from "./UsersAPI";
import type {User} from './UsersAPI';
import {ConfirmationButton, usePagination, UsersContext, useSorting} from '../common';
import UserSelect from "../permissions/UserSelect";
import ProjectUserContext from "../common/contexts/ProjectUserContext";

const checkRole = (role: string) => (user: User) => user.roles.includes(role);

const columns = {
    name: {
        valueExtractor: 'name',
        label: 'Name'
    },
    email: {
        valueExtractor: 'email',
        label: 'Email'
    },
    write: {
        valueExtractor: checkRole('CanWrite'),
        label: 'Write'
    },
    datasteward: {
        valueExtractor: checkRole('DataSteward'),
        label: 'Data steward'
    },
    sparql: {
        valueExtractor: checkRole('SparqlUser'),
        label: 'Sparql'
    },
    coordinator: {
        valueExtractor: checkRole('Coordinator'),
        label: 'Coordinator'
    },

};

const toggleRole = (user: User, role: string) => {
    const altUser = {...user, roles: [...user.roles]};
    if (user.roles.includes(role)) {
        altUser.roles.splice(altUser.roles.indexOf(role), 1);
    } else {
        altUser.roles.push(role);
    }
    return addUser(altUser);
};

const removeUser = (user: User) => addUser({...user, roles: []});

const addNewUser = (user: User) => addUser({...user, roles: ['CanRead']});

const rolesToShow = ['CanWrite', 'DataSteward', 'SparqlUser', 'Coordinator'];

const UserList = () => {
    const {projectUser, refreshProjectUser} = useContext(ProjectUserContext);
    const {users, refresh: refreshUsers} = useContext(UsersContext);
    const projectUsers = users.filter(u => u.roles.includes('CanRead'));
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(projectUsers, columns, 'name');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);
    const {isCoordinator} = useContext(LinkedDataContext);
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [userToAdd, setUserToAdd] = useState(null);
    const refresh = (user) => () => {
        if (user.iri === projectUser.iri) {
            refreshProjectUser();
        }
        refreshUsers();
    };

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
                                {
                                    rolesToShow.map(role => (
                                        <TableCell key={user.iri.concat(".", role)} style={{width: 100}}>
                                            <Checkbox
                                                checked={checkRole(role)(user)}
                                                disabled={!isCoordinator}
                                                onChange={() => toggleRole(user, role).then(refresh(user))}
                                            />
                                        </TableCell>
                                    ))
                                }
                                <TableCell>
                                    <ConfirmationButton
                                        onClick={() => removeUser(user).then(refresh(user))}
                                        disabled={!isCoordinator}
                                        message="Are you sure you want to remove this user from the project?"
                                        agreeButtonText="Remove user"
                                        dangerous
                                    >
                                        <IconButton>
                                            <Delete />
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
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={(e, p) => setPage(p)}
                    onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
                />
            </Paper>
            {
                isCoordinator
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
                <DialogTitle id="scroll-dialog-title">Add user to the project</DialogTitle>
                <DialogContent>
                    <UserSelect
                        autoFocus
                        filter={user => user.roles.length === 0}
                        onChange={setUserToAdd}
                        placeholder="Please select a user"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowAddUserDialog(false);
                            addNewUser(userToAdd).then(refresh(userToAdd));
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
