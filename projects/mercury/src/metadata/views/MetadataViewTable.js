import React, {useEffect, useState} from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow, Typography,
    withStyles
} from '@material-ui/core';
import {useHistory} from "react-router-dom";
import type {MetadataViewColumn, MetadataViewData, MetadataViewFilter} from "./MetadataViewAPI";
import styles from "../../file/FileList.styles";
import LoadingInlay from "../../common/components/LoadingInlay";
import MessageDisplay from "../../common/components/MessageDisplay";
import IriTooltip from "../../common/components/IriTooltip";
import {TOOLTIP_ENTER_DELAY} from "../../constants";
import Iri from "../../common/components/Iri";
import type {MetadataViewEntityWithLinkedFiles} from "./metadataViewUtils";
import {getContextualFileLink, isCollectionView} from "./metadataViewUtils";
import {formatDateTime} from "../../common/utils/genericUtils";
import useViewData from "./UseViewData";


type MetadataViewTableContainerProperties = {
    columns: MetadataViewColumn[];
    filters: MetadataViewFilter[];
    toggleRow: () => {};
    view: string;
    locationContext: string;
    selected: MetadataViewEntityWithLinkedFiles;
    classes: any;
};

type MetadataViewTableProperties = {
    data: MetadataViewData;
    columns: MetadataViewColumn[];
    toggleRow: () => {};
    view: string;
    locationContext: string;
    history: any;
    selected?: MetadataViewEntityWithLinkedFiles;
};

export const MetadataViewTable = (props: MetadataViewTableProperties) => {
    const {columns, data, locationContext, toggleRow, selected, view, history} = props;
    const isCollectionViewTable = isCollectionView(view);
    const idColumn = columns.find(c => c.type === 'id'); // first column of id type
    const dataLinkColumn = columns.find(c => c.type === 'dataLink');

    const handleResultSingleClick = (itemIri, itemLabel, linkedFiles) => {
        if (selected && selected.iri === itemIri) {
            toggleRow();
        } else {
            toggleRow({label: itemLabel, iri: itemIri, linkedFiles: linkedFiles || []});
        }
    };

    const handleResultDoubleClick = (itemIri) => {
        if (isCollectionViewTable) {
            history.push(getContextualFileLink(itemIri, locationContext));
        }
    };

    const renderTableCell = (row, column) => {
        const value = row[column.name];
        let displayValue;
        if (column.type === 'dataLink') {
            displayValue = !value ? 0 : value.length;
        } else if (column.type === 'date') {
            displayValue = formatDateTime(value);
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
        <Table data-testid="results-table">
            <TableHead>
                <TableRow>
                    {columns.map(column => (
                        <TableCell key={column.name}>{column.title}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {idColumn && data.rows.map(row => (
                    <TableRow
                        key={row[idColumn.name]}
                        hover={isCollectionViewTable}
                        selected={selected && selected.iri === row[idColumn.name]}
                        onClick={() => handleResultSingleClick(
                            row[idColumn.name],
                            row[`${idColumn.name}.label`],
                            dataLinkColumn ? row[dataLinkColumn.name] : []
                        )}
                        onDoubleClick={() => handleResultDoubleClick(row[idColumn.name])}
                    >
                        {columns.map(column => renderTableCell(row, column))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export const MetadataViewTableContainer = (props: MetadataViewTableContainerProperties) => {
    const {view, filters} = props;
    const [page, setPage] = useState(0);
    const [warning, setWarning] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const history = useHistory();

    const {data, count, countTimeout, error, loading, refreshDataOnly} = useViewData(view, filters, rowsPerPage);

    useEffect(() => {setPage(0);}, [filters]);

    if (loading) {
        return <LoadingInlay />;
    }

    if (error && error.message) {
        return <MessageDisplay message={error.message} />;
    }

    if (!data || !data.rows || !data.rows.length) {
        return <MessageDisplay message="No results found." />;
    }

    if (data.timeout) {
        setWarning("Results shown below are incomplete. Fetching of data for the current page took too long.");
    } else if (countTimeout) {
        setWarning("Fetching total count of results took too long. The count will not be shown.");
    }

    const handleChangePage = (e, p) => {
        setPage(p);
        refreshDataOnly(p, rowsPerPage);
    };

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(e.target.value);
        setPage(0);
        refreshDataOnly(0, e.target.value);
    };

    return (
        <Paper className={props.classes.root}>
            {warning && (<Typography variant="body2" color="error" align="center">{warning}</Typography>)}
            <TableContainer>
                <MetadataViewTable
                    {...props}
                    data={data}
                    history={history}
                />
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    style={{overflowX: "hidden"}}
                />
            </TableContainer>
        </Paper>
    );
};

export default withStyles(styles)(MetadataViewTableContainer);
