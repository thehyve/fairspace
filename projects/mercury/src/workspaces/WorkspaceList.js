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
    withStyles,
} from "@material-ui/core";
import {Lock} from "@material-ui/icons";

import type {Workspace} from './WorkspacesAPI';
import MessageDisplay from "../common/components/MessageDisplay";
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";

type Accessible = {
    hasAccess: boolean
}

const styles = () => ({
    statusColumn: {
        fontSize: 'small',
        color: 'gray',
    }
});

const columns = {
    canCollaborate: {
        valueExtractor: 'canCollaborate',
        label: ' '
    },
    name: {
        valueExtractor: 'name',
        label: 'Name'
    },
    status: {
        valueExtractor: 'status',
        label: 'Status'
    }
};

const WorkspaceList = ({
    workspaces = [],
    isSelected = () => false,
    toggleWorkspace = () => {},
    classes = {}
}) => {
    const history = useHistory();

    const onWorkspaceDoubleClick = (workspace: Workspace & Accessible) => {
        if (workspace.canCollaborate) {
            history.push(`/workspace?iri=${encodeURI(workspace.iri)}`);
        }
    };
    const onWorkspaceClick = (workspace: Workspace) => {
        toggleWorkspace(workspace);
    };
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(workspaces, columns, 'name');
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
                                key={workspace.iri}
                                hover
                                onClick={() => onWorkspaceClick(workspace)}
                                onDoubleClick={() => onWorkspaceDoubleClick(workspace)}
                                selected={selected}
                            >
                                <TableCell style={{maxWidth: 32}} component="th" scope="row" key="canCollaborate">
                                    {!workspace.canCollaborate && (<Lock />)}
                                </TableCell>
                                <TableCell style={{maxWidth: 160}} component="th" scope="row" key="name">
                                    {workspace.name}
                                </TableCell>
                                <TableCell
                                    style={{maxWidth: 80}}
                                    className={`${classes.statusColumn}`}
                                    component="th"
                                    scope="row"
                                    key="status"
                                >
                                    {workspace.status ? workspace.status.toLocaleUpperCase() : ''}
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

export default withStyles(styles)(WorkspaceList);
