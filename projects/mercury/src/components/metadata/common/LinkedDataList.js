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

const linkedDataList = ({items = [], classes}) => (
    <Paper className={classes.root}>
        <Table className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>URI</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    items.map(({id, label, type, typeLabel}) => (
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
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    </Paper>
);

export default withStyles(styles)(linkedDataList);
