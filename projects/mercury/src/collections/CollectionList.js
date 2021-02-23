import React from 'react';
import {
    Link,
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    withStyles,
} from "@material-ui/core";

import styles from './CollectionList.styles';
import MessageDisplay from "../common/components/MessageDisplay";
import {camelCaseToWords, formatDateTime} from "../common/utils/genericUtils";
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";
import {currentWorkspace} from '../workspaces/workspaces';
import {accessLevelForCollection, collectionAccessIcon} from './collectionUtils';

const baseColumns = {
    name: {
        valueExtractor: 'name',
        label: 'Name'
    },
    workspace: {
        valueExtractor: 'ownerWorkspaceName',
        label: 'Workspace'
    },
    status: {
        valueExtractor: 'status',
        label: 'Status'
    },
    viewMode: {
        valueExtractor: 'accessMode',
        label: 'View mode'
    },
    access: {
        valueExtractor: 'access',
        label: 'Access'
    },
    created: {
        valueExtractor: 'dateCreated',
        label: 'Created'
    },
    creator: {
        valueExtractor: 'creatorDisplayName',
        label: 'Creator'
    }
};

const allColumns = {
    ...baseColumns,
    dateDeleted: {
        valueExtractor: 'dateDeleted',
        label: 'Deleted'
    }
};

const CollectionList = ({
    collections = [],
    isSelected = () => false,
    showDeleted,
    onCollectionClick,
    onCollectionDoubleClick,
    classes
}) => {
    const columns = {...baseColumns};
    if (currentWorkspace()) {
        delete columns.workspace;
    }

    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(collections, allColumns, 'name');
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);

    if (!collections || collections.length === 0) {
        return (
            <MessageDisplay
                message="Please create a collection."
                variant="h6"
                withIcon={false}
                isError={false}
                messageColor="textSecondary"
            />
        );
    }

    return (
        <Paper className={classes.root}>
            <TableContainer>
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
                            {showDeleted && (
                                <TableCell key="dateDeleted">
                                    <TableSortLabel
                                        active={orderBy === 'dateDeleted'}
                                        direction={orderAscending ? 'asc' : 'desc'}
                                        onClick={() => toggleSort('dateDeleted')}
                                    >
                                    Deleted
                                    </TableSortLabel>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pagedItems.map((collection) => {
                            const selected = isSelected(collection);
                            const accessLevel = accessLevelForCollection(collection);

                            return (
                                <TableRow
                                    key={collection.iri}
                                    hover
                                    onClick={() => onCollectionClick(collection)}
                                    onDoubleClick={() => onCollectionDoubleClick(collection)}
                                    selected={selected}
                                    className={collection.dateDeleted && classes.deletedCollectionRow}
                                >
                                    <TableCell style={{overflowWrap: "break-word", maxWidth: 160}} scope="row">
                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                        <Link
                                            component="button"
                                            onClick={(e) => {e.stopPropagation(); onCollectionDoubleClick(collection);}}
                                            color="inherit"
                                            variant="body2"
                                            style={{textAlign: "left"}}
                                        >
                                            <ListItemText
                                                style={{margin: 0}}
                                                primary={collection.name}
                                                secondary={collection.description}
                                            />
                                        </Link>
                                    </TableCell>
                                    { currentWorkspace() ? null : (
                                        <TableCell style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 160
                                        }}
                                        >
                                            {collection.ownerWorkspaceName}
                                        </TableCell>
                                    ) }
                                    <TableCell>
                                        {collection.status}
                                    </TableCell>
                                    <TableCell>
                                        {camelCaseToWords(collection.accessMode)}
                                    </TableCell>
                                    <TableCell>
                                        {collectionAccessIcon(accessLevel)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDateTime(collection.dateCreated)}
                                    </TableCell>
                                    <TableCell>
                                        {collection.creatorDisplayName}
                                    </TableCell>
                                    {showDeleted && (
                                        <TableCell>
                                            {formatDateTime(collection.dateDeleted)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={collections.length}
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

export default withStyles(styles, {withTheme: true})(CollectionList);
