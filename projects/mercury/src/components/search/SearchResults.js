import React from 'react';
import {Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import * as PropTypes from "prop-types";
import {LoadingInlay} from "../common";
import SearchResultHighlights from "./SearchResultHighlights";

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
    };

    if (loading) {
        contents = <LoadingInlay />;
    } else if (!results || results.total === 0) {
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
                        {results.items.map((result) => (
                            <TableRow
                                hover
                                key={result.id}
                                onDoubleClick={() => onResultDoubleClick(result)}
                            >
                                <TableCell style={{maxWidth: 160}} component="th" scope="row">
                                    {result.label}
                                </TableCell>
                                <TableCell padding="none">
                                    {generateTypeLabel(result.type)}
                                </TableCell>
                                <TableCell>
                                    {result.comment}
                                </TableCell>
                                <TableCell>
                                    <SearchResultHighlights highlights={result.highlight} />
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
