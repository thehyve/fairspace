import React from 'react';
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, withStyles, Paper,
} from "@material-ui/core";

import {DateTime} from "../common";
import styles from './CollectionList.styles';
import getDisplayName from "../../utils/userUtils";

const collectionList = (props) => {
    const {
        collections, selectedCollectionLocation,
        onCollectionClick, onCollectionDoubleClick, classes
    } = props;

    if (!collections || collections.length === 0) {
        return "No collections";
    }

    return (
        <Paper className={classes.root}>
            <Table padding="dense">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Creator</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {collections.map((collection) => {
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
        </Paper>
    );
};

export default withStyles(styles, {withTheme: true})(collectionList);
