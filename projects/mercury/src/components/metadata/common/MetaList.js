import React from "react";
import {Paper, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";

import MetadataLink from "../MetadataLink";

const metaList = ({items = []}) => (
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
                                <MetadataLink uri={id}>
                                    {label}
                                </MetadataLink>
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    </Paper>
);

export default metaList;
