import React from 'react';
import {Paper, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, TablePagination, withStyles} from "@material-ui/core";

import {DateTime} from "../common";
import styles from './CollectionList.styles';
import getDisplayName from "../../utils/userUtils";
import useSorting from "../common/useSorting";
import usePagination from "../common/usePagination";

const CollectionList = (props) => {
    const {
        collections = [],
        selectedCollectionLocation,
        onCollectionClick,
        onCollectionDoubleClick, classes
    } = props;

    // Extend collections with displayName to avoid computing it when sorting
    const collectionsWithDisplayName = collections.map(collection => ({
        ...collection,
        displayName: getDisplayName(collection.creatorObj)
    }));

    const columns = {
        name: {
            valueExtractor: 'name',
            label: 'Name'
        },
        created: {
            valueExtractor: 'dateCreated',
            label: 'Created'
        },
        creator: {
            valueExtractor: 'displayName',
            label: 'Creator'
        }
    };

    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(collectionsWithDisplayName, columns);
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(orderedItems);

    if (!collections || collections.length === 0) {
        return "No collections";
    }

    return (
        <Paper className={classes.root}>
            <Table padding="dense">
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
                    {pagedItems.map((collection) => {
                        const selected = selectedCollectionLocation && (collection.location === selectedCollectionLocation);

                        return (
                            <TableRow
                                key={collection.iri}
                                hover
                                onClick={() => onCollectionClick(collection)}
                                onDoubleClick={() => onCollectionDoubleClick(collection)}
                                selected={selected}
                            >
                                <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                    {collection.name}
                                </TableCell>
                                <TableCell padding="none">
                                    <DateTime value={collection.dateCreated} />
                                </TableCell>
                                <TableCell>
                                    {getDisplayName(collection.creatorObj)}
                                </TableCell>
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
            />
        </Paper>
    );
};

export default withStyles(styles, {withTheme: true})(CollectionList);
