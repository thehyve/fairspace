// @flow
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

import type {Workspace} from './WorkspacesAPI';
import MessageDisplay from "../common/components/MessageDisplay";
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";
import {isAdmin} from '../users/userUtils';
import UserContext from '../users/UserContext';
import CollectionsContext from '../collections/CollectionsContext';
import WorkspaceActionMenu from './WorkspaceActionMenu';

type WorkspaceListProps = {
    workspaces: Workspace[];
};

const columns = {
    canCollaborate: {
        valueExtractor: 'canCollaborate',
        label: ' '
    },
    name: {
        valueExtractor: 'name',
        label: 'Name'
    },
    menu: {
        label: ' '
    }
};

const WorkspaceList = (props: WorkspaceListProps) => {
    const {workspaces} = props;
    const history = useHistory();
    const {currentUser} = useContext(UserContext);
    const {collections} = useContext(CollectionsContext);

    const isWorkspaceEmpty = (workspace: Workspace) => !collections.some(c => c.ownerWorkspace === workspace.iri);

    const onWorkspaceDoubleClick = (workspace: Workspace) => {
        if (workspace.canCollaborate) {
            history.push(`/workspace?iri=${encodeURI(workspace.iri)}`);
        }
    };
    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(workspaces, columns, 'name');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);

    if (!props.workspaces || props.workspaces.length === 0) {
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
        <>
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
                                key={workspace.iri}
                                hover
                                onDoubleClick={() => onWorkspaceDoubleClick(workspace)}
                            >
                                <TableCell style={{maxWidth: 32, width: 32}} scope="row" key="canCollaborate">
                                    {!workspace.canCollaborate && (<Lock />)}
                                </TableCell>
                                <TableCell style={{maxWidth: 160}} scope="row" key="name">
                                    {workspace.name}
                                </TableCell>
                                <TableCell style={{maxWidth: 32}} scope="row" key="menu">
                                    { isAdmin(currentUser) && isWorkspaceEmpty(workspace)
                                        ? <WorkspaceActionMenu small workspace={workspace} /> : null }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={props.workspaces.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={(e, p) => setPage(p)}
                    onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
                />
            </Paper>
        </>
    );
};

export default WorkspaceList;
