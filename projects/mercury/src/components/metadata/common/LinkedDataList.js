import React from "react";
import {Paper, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";

import LinkedDataLink from "./LinkedDataLink";

const linkedDataList = ({items = []}) => (
    <Paper>
        <Table>
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
                            <TableCell>
                                {label}
                            </TableCell>
                            <TableCell>
                                <a href={type}> {typeLabel} </a>
                            </TableCell>
                            <TableCell>
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

export default linkedDataList;
