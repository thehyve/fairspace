import React, {useContext} from 'react';
import {useHistory} from 'react-router-dom';
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
import {Lock} from "@material-ui/icons";
import {MessageDisplay, usePagination, useSorting} from '../common';

import type {Workspace} from './WorkspacesAPI';
import {UserContext} from "../common/contexts";
import {isAdmin} from "../common/utils/userUtils";

type Accessible = {
    hasAccess: boolean
}

const columns = {
    hasAccess: {
        valueExtractor: 'hasAccess',
        label: ' '
    },
    id: {
        valueExtractor: 'id',
        label: 'Id'
    },
    label: {
        valueExtractor: 'label',
        label: 'Label'
    }
};

const WorkspaceList = ({
    workspaces = [],
    isSelected = () => false,
    toggleWorkspace = () => {}
}) => {
    const {currentUser = {authorizations: []}} = useContext(UserContext);
    const history = useHistory();

    const onWorkspaceDoubleClick = (workspace: Workspace & Accessible) => {
        if (workspace.hasAccess) {
            history.push(`/workspaces/${workspace.id}/`);
        }
    };
    const onWorkspaceClick = (workspace: Workspace & Accessible) => {
        toggleWorkspace(workspace);
    };

    const workspacesWithAccess = workspaces.map(ws => ({...ws, hasAccess: isAdmin(currentUser) || ws.canRead}));
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(workspacesWithAccess, columns, 'id');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);

    if (!workspaces || workspaces.length === 0) {
        return (
            <MessageDisplay
                message="Please create a workspace."
                variant="h6"
                withIcon={false}
                isError={false}
                messageColor="textSecondary"
            />
        );
    }


    return (
        <Paper>
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
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pagedItems.map((workspace: Workspace & Accessible) => {
                        const selected = isSelected(workspace);

                        return (
                            <TableRow
                                key={workspace.id}
                                hover
                                onClick={() => onWorkspaceClick(workspace)}
                                onDoubleClick={() => onWorkspaceDoubleClick(workspace)}
                                selected={selected}
                            >
                                <TableCell style={{maxWidth: 32}} component="th" scope="row" key="hasAccess">
                                    {!workspace.hasAccess && (<Lock />)}
                                </TableCell>
                                <TableCell style={{maxWidth: 160}} component="th" scope="row" key="id">
                                    {workspace.id}
                                </TableCell>
                                <TableCell style={{maxWidth: 160}} component="th" scope="row" key="label">
                                    {workspace.label}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={workspaces.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={(e, p) => setPage(p)}
                onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
            />
        </Paper>
    );
};

export default WorkspaceList;
