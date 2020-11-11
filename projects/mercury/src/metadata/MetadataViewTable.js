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
import {useHistory} from "react-router-dom";
import type {MetadataViewColumn, MetadataViewFilter} from "./MetadataViewAPI";
import styles from "../file/FileList.styles";
import useAsync from "../common/hooks/UseAsync";
import MetadataViewAPI from "./MetadataViewAPI";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import IriTooltip from "../common/components/IriTooltip";
import {TOOLTIP_ENTER_DELAY} from "../constants";
import Iri from "../common/components/Iri";
import {getCollectionAbsolutePath, pathForIri} from "../collections/collectionUtils";
import {isCollectionView, LINKED_FILES_COLUMN_NAME} from "./metadataViewUtils";
import {getParentPath} from "../file/fileUtils";


type MetadataViewTableProperties = {
    columns: MetadataViewColumn[];
    filters: MetadataViewFilter[];
    view: string;
    locationContext: string;
    classes: any
};

export const MetadataViewTable = (props: MetadataViewTableProperties) => {
    const {columns = [], locationContext} = props;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const history = useHistory();
    const isCollectionViewTable = isCollectionView(props.view);

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

    const link = (item) => {
        const path = pathForIri(item);
        if (locationContext && locationContext !== "") {
            const parentPath = getParentPath(path);
            return `${getCollectionAbsolutePath(parentPath)}?selection=${encodeURIComponent(`/${path}`)}`;
        }
        return getCollectionAbsolutePath(path);
    };

    const handleResultDoubleClick = (item) => {
        if (isCollectionViewTable) {
            history.push(link(item));
        }
    };

    const renderTableCell = (row, column) => {
        const value = row[column.name];
        let displayValue;
        if (column.name === LINKED_FILES_COLUMN_NAME) {
            displayValue = !value ? 0 : value.length;
        } else {
            displayValue = row[`${column.name}.label`] || value;
        }
        return (
            <TableCell key={column.name}>
                {row[`${column.name}.label`] ? (
                    <IriTooltip
                        key={column.name}
                        enterDelay={TOOLTIP_ENTER_DELAY}
                        title={<Iri iri={value} />}
                    >
                        <span>{displayValue}</span>
                    </IriTooltip>
                ) : (
                    <span>{displayValue}</span>
                )}
            </TableCell>
        );
    };

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
                                <TableRow
                                    key={`${row[columns[0].name]}`}
                                    hover={isCollectionViewTable}
                                    onDoubleClick={() => handleResultDoubleClick(row[columns[0].name])}
                                >
                                    {columns.map(column => renderTableCell(row, column))}
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
