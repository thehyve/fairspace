import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import type {MetadataViewColumn, MetadataViewData} from "./MetadataViewAPI";
import type {MetadataViewEntityWithLinkedFiles} from "./metadataViewUtils";
import {getContextualFileLink, isFilesView} from "./metadataViewUtils";
import {makeStyles} from '@material-ui/core/styles';
import {formatDateTime} from "../../common/utils/genericUtils";

type MetadataViewTableProperties = {
    data: MetadataViewData;
    columns: MetadataViewColumn[];
    visibleColumnNames: string[];
    idColumn: MetadataViewColumn;
    toggleRow: () => {};
    view: string;
    history: any;
    selected?: MetadataViewEntityWithLinkedFiles;
};

const useStyles = makeStyles(() => ({
    cellContents: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }
}));

export const MetadataViewTable = (props: MetadataViewTableProperties) => {
    const {columns, visibleColumnNames, data, toggleRow, selected, view, idColumn, history} = props;
    const classes = useStyles();
    const visibleColumns = columns.filter(column => visibleColumnNames.includes(column.name));
    const isCollectionViewTable = isFilesView(view);
    const dataLinkColumn = columns.find(c => c.type === 'dataLink');
    const {rows} = data;

    const handleResultSingleClick = (itemIri, itemLabel, linkedFiles) => {
        if (selected && selected.iri === itemIri) {
            toggleRow();
        } else {
            toggleRow({label: itemLabel, iri: itemIri, linkedFiles: linkedFiles || []});
        }
    };

    const handleResultDoubleClick = (itemIri) => {
        if (isCollectionViewTable) {
            history.push(getContextualFileLink(itemIri));
        }
    };

    const renderTableCell = (row, column) => {
        const value = row[column.name];
        const displayValue = (value || []).map(v => ((column.type === 'Date') ? formatDateTime(v.value) : v.label)).join(', ');

        return (
            <TableCell key={column.name}>
                <span className={classes.cellContents}>{displayValue}</span>
            </TableCell>
        );
    };

    return (
        <Table data-testid="results-table" size="small" stickyHeader>
            <TableHead>
                <TableRow>
                    {visibleColumns.map(column => (
                        <TableCell key={column.name} className={classes.cellContents}>{column.title}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {idColumn && rows.map(row => (
                    <TableRow
                        className={classes.row}
                        key={row[idColumn.name]}
                        hover={isCollectionViewTable}
                        selected={selected && selected.iri === row[idColumn.name]}
                        onClick={() => handleResultSingleClick(
                            row[idColumn.name][0].value,
                            row[idColumn.name][0].label,
                            dataLinkColumn ? row[dataLinkColumn.name] : []
                        )}
                        onDoubleClick={() => handleResultDoubleClick(row[idColumn.name][0].value)}
                    >
                        {visibleColumns.map(column => renderTableCell(row, column))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default MetadataViewTable;
