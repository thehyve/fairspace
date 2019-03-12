import React from 'react';
import {Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import * as PropTypes from "prop-types";
import {LoadingInlay} from "../common";
import SearchResultHighlights from "./SearchResultHighlights";

/* eslint-disable no-underscore-dangle */
const searchResults = ({
    loading,
    results,
    onResultDoubleClick,
    vocabulary
}) => {
    let contents;

    const generateTypeLabel = (typeUri) => {
        // If vocabulary has not been loaded, we can not
        // retrieve the label. Just return the URI in that (rare) case
        if (!vocabulary) {
            return typeUri;
        }

        return vocabulary.getLabelForPredicate(typeUri);
    }

    if (loading) {
        contents = <LoadingInlay />;
    } else if (!results || !results.hits || results.hits.total === 0) {
        contents = 'No results found!';
    } else {
        contents = (
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
                        {results.hits.hits.map((hit) => (
                            <TableRow
                                hover
                                key={hit._id}
                                onDoubleClick={() => onResultDoubleClick(hit)}
                            >
                                <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                    {hit._source.label}
                                </TableCell>
                                <TableCell padding="none">
                                    {generateTypeLabel(hit._source.type)}
                                </TableCell>
                                <TableCell>
                                    {hit._source.comment}
                                </TableCell>
                                <TableCell>
                                    <SearchResultHighlights highlights={hit.highlight} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        );
    }

    return (
        <Grid container spacing={8}>
            {contents}
        </Grid>
    );
};

searchResults.propTypes = {
    onResultDoubleClick: PropTypes.func.isRequired
};

export default searchResults;
