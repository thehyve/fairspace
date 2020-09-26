import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';

type MetadataViewColumn = {
    field: string;
    label: string;
};

type MetadataViewTableProperties = {
    columns: MetadataViewColumn[];
    data: any[]
};

export const MetadataViewTable = (props: MetadataViewTableProperties) => {
    const {columns, data} = props;
    return (
        <Table>
            <TableHead>
                <TableRow>
                    {columns.map(column => (
                        <TableCell key={column.field}>{column.label}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map(row => (
                    <TableRow key={row.iri}>
                        {columns.map(column => {
                            const value = row[column.field];
                            const displayValue = value.label || value;
                            return <TableCell key={column.field}>{displayValue}</TableCell>;
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default MetadataViewTable;
