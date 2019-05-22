import React from 'react';
import PropTypes from "prop-types";
import {
    Paper, Table, TableBody,
    TableCell, TableHead, TableRow
} from '@material-ui/core';

import {LoadingInlay, MessageDisplay} from "../common";
import SearchResultHighlights from "./SearchResultHighlights";

const searchResults = ({
    loading,
    results,
    onResultDoubleClick,
    vocabulary
}) => {
    // If vocabulary has not been loaded, we can not
    // retrieve the label. Just return the URI in that (rare) case
    const generateTypeLabel = (typeUri) => (vocabulary ? vocabulary.getLabelForPredicate(typeUri) : typeUri);

    if (loading) {
        return <LoadingInlay />;
    }

    if (!results || results.total === 0) {
        return <MessageDisplay message="No results found!" isError={false} />;
    }

    return (
        <Paper style={{width: '100%'}}>
            <Table padding="dense">
                <TableHead>
                    <TableRow>
                        <TableCell>Label</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Match</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {results.items
                        .map((item) => (
                            <TableRow
                                hover
                                key={item.id}
                                onDoubleClick={() => onResultDoubleClick(item)}
                            >
                                <TableCell>
                                    {item.label}
                                </TableCell>
                                <TableCell>
                                    {generateTypeLabel(item.type)}
                                </TableCell>
                                <TableCell>
                                    {item.comment}
                                </TableCell>
                                <TableCell>
                                    <SearchResultHighlights highlights={item.highlight} />
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

searchResults.propTypes = {
    onResultDoubleClick: PropTypes.func.isRequired
};

export default searchResults;
