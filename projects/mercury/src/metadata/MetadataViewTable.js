import React, {useState} from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    withStyles
} from '@material-ui/core';
import type {MetadataViewColumn, MetadataViewData, MetadataViewFilter} from "./MetadataViewAPI";
import styles from "../file/FileList.styles";
import useAsync from "../common/hooks/UseAsync";
import MetadataViewAPI from "./MetadataViewAPI";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";


type MetadataViewTableProperties = {
    columns: MetadataViewColumn[];
    filters: MetadataViewFilter[];
    view: string;
    classes: any
};

export const MetadataViewTable = (props: MetadataViewTableProperties) => {
    const {columns = []} = props;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const {data = [], error, loading} = useAsync(
        () => MetadataViewAPI.getViewData(props.view, page, rowsPerPage, props.filters),
        [page, rowsPerPage, props.view]
    );

    if (loading) {
        return <LoadingInlay />;
    }

    if (!loading && error && error.message) {
        return <MessageDisplay message={error.message} />;
    }

    return (
        <Paper className={props.classes.root}>
            {data && data.rows && (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map(column => (
                                    <TableCell key={column.name}>{column.title}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.rows.map(row => (
                                <TableRow key={`views-${props.view}-${row[columns[0].name]}`}>
                                    {columns.map(column => {
                                        const value = row[column.name];
                                        const displayValue = row[`${column.name}.label`] || value;
                                        return <TableCell key={column.name}>{displayValue}</TableCell>;
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={data.rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={(e, p) => setPage(p)}
                        onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
                        style={{overflowX: "hidden"}}
                    />
                </TableContainer>
            )}
        </Paper>
    );
};

export default withStyles(styles)(MetadataViewTable);
