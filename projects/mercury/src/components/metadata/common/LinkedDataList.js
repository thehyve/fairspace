import React from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    withStyles
} from "@material-ui/core";

import LinkedDataLink from "./LinkedDataLink";
import styles from './LinkedDataList.styles';
import SearchResultHighlights from "../../search/SearchResultHighlights";

const linkedDataList = ({items = [], hasHighlights, classes}) => (
    <Paper className={classes.root}>
        <Table className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>URI</TableCell>
                    {hasHighlights && <TableCell>Match</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    items.map(({id, label, type, typeLabel, highlights}) => (
                        <TableRow key={id}>
                            <TableCell className={classes.cell}>
                                {label}
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <a href={type}> {typeLabel} </a>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <LinkedDataLink uri={id}>
                                    {label}
                                </LinkedDataLink>
                            </TableCell>
                            {hasHighlights && (
                                <TableCell>
                                    <SearchResultHighlights highlights={highlights} />
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    </Paper>
);

export default withStyles(styles)(linkedDataList);
