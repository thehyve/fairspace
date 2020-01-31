import React from 'react';
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
import {MessageDisplay, usePagination, useSorting} from '../common';

import type {Workspace} from './WorkspacesAPI';

const columns = {
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
    workspaces = []
}) => {
    const history = useHistory();

    const onWorkspaceDoubleClick = (workspace: Workspace) => {
        history.push(`/workspaces/${workspace.id}/`);
    };

    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(workspaces, columns, 'id');
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
                    {pagedItems.map((workspace: Workspace) => (
                        <TableRow
                            key={workspace.id}
                            hover
                            onClick={() => {}}
                            onDoubleClick={() => onWorkspaceDoubleClick(workspace)}
                        >
                            {
                                Object.entries(columns).map(([key, column]) => (
                                    <TableCell style={{maxWidth: 160}} component="th" scope="row" key={key}>
                                        {workspace[column.valueExtractor]}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    ))}
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
