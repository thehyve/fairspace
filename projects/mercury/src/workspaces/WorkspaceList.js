// @flow
import React, {useContext} from 'react';
import {useHistory} from 'react-router-dom';
import {
    Chip,
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
    comment: {
        valueExtractor: 'comment',
        label: 'Short description'
    },
    collectionCount: {
        valueExtractor: 'summary.collectionCount',
        label: 'Collections',
        align: 'right'
    },
    memberCount: {
        valueExtractor: 'summary.memberCount',
        label: 'Members',
        align: 'right'
    },
    managers: {
        valueExtractor: 'managers',
        label: 'Managers'
    },
    menu: {
        label: ' '
    }
};

const EmailChip = ({email, label}) => {
    const chip = <Chip style={{cursor: email ? 'pointer' : 'default'}} size="small" label={label} />;
    if (email) {
        return <a title={email} href={`mailto:${email}`}>{chip}</a>;
    }
    return chip;
};

const WorkspaceList = (props: WorkspaceListProps) => {
    const {workspaces} = props;
    const history = useHistory();
    const {currentUser} = useContext(UserContext);

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
                                    <TableCell key={key} align={column.align ? column.align : 'inherit'}>
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
                                <TableCell variant="head" style={{minWidth: 150, maxWidth: 150}} scope="row" key="name">
                                    {workspace.name}
                                </TableCell>
                                <TableCell style={{minWidth: 250, maxWidth: 350}} scope="row" key="comment">
                                    {workspace.comment}
                                </TableCell>
                                <TableCell align="right" style={{maxWidth: 32, width: 32}} scope="row" key="collectionCount">
                                    {workspace.summary ? workspace.summary.collectionCount : ''}
                                </TableCell>
                                <TableCell align="right" style={{maxWidth: 32, width: 32}} scope="row" key="memberCount">
                                    {workspace.summary ? workspace.summary.memberCount : ''}
                                </TableCell>
                                <TableCell style={{maxWidth: 150, width: 150}} scope="row" key="managers">
                                    {workspace.managers ? workspace.managers.map(m => (
                                        <EmailChip key={m.iri} email={m.email} label={m.name} />
                                    )) : ''}
                                </TableCell>
                                <TableCell style={{maxWidth: 32, width: 32}} scope="row" key="menu">
                                    { isAdmin(currentUser) && <WorkspaceActionMenu small workspace={workspace} /> }
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
