import React, {useContext, useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
} from "@material-ui/core";

import Checkbox from "@material-ui/core/Checkbox";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import UsersContext from "./UsersContext";
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import {setUserRole} from "./UsersAPI";
import ErrorDialog from "../common/components/ErrorDialog";
import usePageTitleUpdater from "../common/hooks/UsePageTitleUpdater";
import ColumnFilterInput from "../common/components/ColumnFilterInput";

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

const roleSelectionColumns = [
    columns.superadmin, columns.admin, columns.viewPublicData, columns.viewPublicMetadata, columns.addSharedMetadata
];

const UserRolesPage = () => {
    usePageTitleUpdater("Users");

    const {users = [], usersLoading, usersError, refresh} = useContext(UsersContext);
    const [filteredUser, setFilteredUsers] = useState(users);
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(filteredUser, columns, 'name');
    const [filtersObject, setFiltersObject] = useState({});

    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);

    const isValueMatchingFilterValue: boolean = (value: string, filterValue: string) => (
        !filterValue || (value && value.toLowerCase().includes(filterValue.toLowerCase()))
    );

    useEffect(() => {
        if (users && users.length > 0) {
            if (!filtersObject || Object.keys(filtersObject).length === 0 || Object.values(filtersObject).every(v => v === "")) {
                setFilteredUsers(users);
            } else {
                setFilteredUsers(users.filter(u => (
                    isValueMatchingFilterValue(u.name, filtersObject[columns.name.valueExtractor])
                    && isValueMatchingFilterValue(u.username, filtersObject[columns.username.valueExtractor])
                    && isValueMatchingFilterValue(u.email, filtersObject[columns.email.valueExtractor])
                )));
            }
            setPage(0);
        }
    }, [filtersObject, users, setPage]);

    if (usersError) {
        return (<MessageDisplay message="An error occurred loading users" />);
    } if (usersLoading) {
        return (<LoadingInlay />);
    }

    const toggleRole = (id, role, enable) => setUserRole(id, role, enable)
        .then(refresh)
        .catch(e => ErrorDialog.showError("Error assigning role", e));

    const renderColumnFilter = (columnName: string) => {
        const filterValue = filtersObject[columnName];
        const setFilterValue = value => setFiltersObject({...filtersObject, [columnName]: value});
        return (
            <ColumnFilterInput placeholder={`Filter by ${columnName}`} filterValue={filterValue} setFilterValue={setFilterValue} />
        );
    };

    const renderHeaderCellWithFilter = (column) => (
        <TableCell key={column.valueExtractor}>
            <TableSortLabel
                active={orderBy === column.valueExtractor}
                direction={orderAscending ? 'asc' : 'desc'}
                onClick={() => toggleSort(column.valueExtractor)}
            >
                {column.label}
            </TableSortLabel>
            {renderColumnFilter(column.valueExtractor)}
        </TableCell>
    );

    return (
        <Paper style={{marginTop: 16}}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {renderHeaderCellWithFilter(columns.name)}
                            {renderHeaderCellWithFilter(columns.username)}
                            {renderHeaderCellWithFilter(columns.email)}
                            {
                                Object.entries(roleSelectionColumns).map(([key, column]) => (
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
                                <TableCell style={{minWidth: 220}} component="th" scope="row">
                                    {u.name}
                                </TableCell>
                                <TableCell style={{minWidth: 160}} component="th" scope="row">
                                    {u.username}
                                </TableCell>
                                <TableCell style={{maxWidth: 180}} component="th" scope="row">
                                    {u.email}
                                </TableCell>
                                <TableCell style={{width: 80}}>
                                    <Checkbox
                                        checked={u.isSuperadmin}
                                        disabled
                                    />
                                </TableCell>
                                <TableCell style={{width: 80}}>
                                    <Checkbox
                                        checked={u.isAdmin}
                                        onChange={(e) => toggleRole(u.id, 'isAdmin', e.target.checked)}
                                        disabled={u.isSuperadmin}
                                    />
                                </TableCell>
                                <TableCell style={{width: 80}}>
                                    <Checkbox
                                        checked={u.canViewPublicData}
                                        onChange={(e) => toggleRole(u.id, 'canViewPublicData', e.target.checked)}
                                        disabled={u.isAdmin}
                                    />
                                </TableCell>
                                <TableCell style={{width: 80}}>
                                    <Checkbox
                                        checked={u.canViewPublicMetadata}
                                        onChange={(e) => toggleRole(u.id, 'canViewPublicMetadata', e.target.checked)}
                                        disabled={u.canViewPublicData}
                                    />
                                </TableCell>
                                <TableCell style={{width: 80}}>
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
                    style={{overflowX: "hidden"}}
                />
            </TableContainer>
        </Paper>
    );
};

export default UserRolesPage;
