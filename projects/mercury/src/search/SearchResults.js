import React from 'react';
import PropTypes from "prop-types";
import {
    Paper, Table, TableBody,
    TableCell, TableHead, TableRow
} from '@material-ui/core';

import SearchResultHighlights from "./SearchResultHighlights";

const searchResults = ({headerLabels, results, onResultDoubleClick}) => (
    <Paper style={{width: '100%'}}>
        <Table padding="dense">
            <TableHead>
                <TableRow>
                    {headerLabels
                        .map((label) => (
                            <TableCell key={label}>
                                {label}
                            </TableCell>
                        ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {results
                    .map(({id, columns, highlights}) => (
                        <TableRow
                            hover
                            key={id}
                            onDoubleClick={() => onResultDoubleClick(id)}
                        >
                            {columns
                                .map((column, idx) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <TableCell key={idx}>
                                        {column}
                                    </TableCell>
                                ))}
                            <TableCell>
                                <SearchResultHighlights highlights={highlights} />
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    </Paper>
);

searchResults.propTypes = {
    headerLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
    results: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        columns: PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
        ).isRequired,
        highlights: PropTypes.arrayOf.isRequired
    })).isRequired,
    onResultDoubleClick: PropTypes.func.isRequired
};

export default searchResults;
