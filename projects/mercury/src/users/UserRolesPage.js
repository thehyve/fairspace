import React, {useContext} from 'react';
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
import UsersContext from "./UsersContext";
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import {setUserRole} from "./UsersAPI";
import ErrorDialog from "../common/components/ErrorDialog";

const columns = {
    name: {
        valueExtractor: 'name',
        label: 'Name'
    },
    username: {
        valueExtractor: 'username',
        label: 'Username'
    },
    email: {
        valueExtractor: 'email',
        label: 'Email'
    },
    superadmin: {
        valueExtractor: 'isSuperadmin',
        label: 'Superadmin'
    },
    admin: {
        valueExtractor: 'isAdmin',
        label: 'Admin'
    },
    viewPublicData: {
        valueExtractor: 'canViewPublicData',
        label: 'View public data'
    },
    viewPublicMetadata: {
        valueExtractor: 'canViewPublicMetadata',
        label: 'View public metadata'
    },
    addSharedMetadata: {
        valueExtractor: 'canAddSharedMetadata',
        label: 'Add shared metadata'
    }
};

const UserRolesPage = () => {
    const {users, usersLoading, usersError, refresh} = useContext(UsersContext);
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(users || [], columns, 'name');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);

    if (usersError) {
        return (<MessageDisplay message="An error occurred loading users" />);
    } if (usersLoading) {
        return (<LoadingInlay />);
    }

    const toggleRole = (id, role, enable) => setUserRole(id, role, enable)
        .then(refresh)
        .catch(e => ErrorDialog.showError("Error assigning role", e));

    return (
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
                            key={u.iri}
                            hover
                        >
                            <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                {u.name}
                            </TableCell>
                            <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                {u.username}
                            </TableCell>
                            <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                {u.email}
                            </TableCell>
                            <TableCell style={{width: 120}}>
                                <Checkbox
                                    checked={u.isSuperadmin}
                                    disabled
                                />
                            </TableCell>
                            <TableCell style={{width: 120}}>
                                <Checkbox
                                    checked={u.isAdmin}
                                    onChange={(e) => toggleRole(u.id, 'isAdmin', e.target.checked)}
                                    disabled={u.isSuperadmin}
                                />
                            </TableCell>
                            <TableCell style={{width: 120}}>
                                <Checkbox
                                    checked={u.canViewPublicData}
                                    onChange={(e) => toggleRole(u.id, 'canViewPublicData', e.target.checked)}
                                    disabled={u.isAdmin}
                                />
                            </TableCell>
                            <TableCell style={{width: 120}}>
                                <Checkbox
                                    checked={u.canViewPublicMetadata}
                                    onChange={(e) => toggleRole(u.id, 'canViewPublicMetadata', e.target.checked)}
                                    disabled={u.canViewPublicData}
                                />
                            </TableCell>
                            <TableCell style={{width: 120}}>
                                <Checkbox
                                    checked={u.canAddSharedMetadata}
                                    onChange={(e) => toggleRole(u.id, 'canAddSharedMetadata', e.target.checked)}
                                    disabled={u.isSuperadmin}
                                />
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
    );
};

export default UserRolesPage;
