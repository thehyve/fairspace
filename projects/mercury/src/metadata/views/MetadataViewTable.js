import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import type {MetadataViewColumn, MetadataViewData} from "./MetadataViewAPI";
import IriTooltip from "../../common/components/IriTooltip";
import {TOOLTIP_ENTER_DELAY} from "../../constants";
import Iri from "../../common/components/Iri";
import type {MetadataViewEntityWithLinkedFiles} from "./metadataViewUtils";
import {getContextualFileLink, isFilesView} from "./metadataViewUtils";
import {formatDateTime} from "../../common/utils/genericUtils";
import {makeStyles} from '@material-ui/core/styles';

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

const mergeRows = (rows: any[], idColumn: string, valueSetColumns: string[], termSetColumns: string[]): any[] => {
    const ids = [];
    const result = [];
    rows.forEach(row => {
        const id = row[idColumn];
        if (ids.includes(id)) {
            const index = ids.indexOf(id);
            valueSetColumns.forEach(column => {
                const val = row[column];
                if (val && !result[index][column].includes(val)) {
                    result[index][column].push(val);
                }
            });
            termSetColumns.forEach(column => {
                const labelColumn = `${column}.label`;
                const val = row[column];
                if (val && !result[index][column].includes(val)) {
                    result[index][column].push(val);
                    result[index][labelColumn].push(row[labelColumn]);
                }
            });
        } else {
            ids.push(id);
            const rowValues = {...row};
            valueSetColumns.forEach(column => {
                rowValues[column] = [row[column]];
            });
            termSetColumns.forEach(column => {
                const labelColumn = `${column}.label`;
                rowValues[column] = [row[column]];
                rowValues[labelColumn] = [row[labelColumn]];
            });
            result.push(rowValues);
        }
    });
    return result;
};

export const MetadataViewTable = (props: MetadataViewTableProperties) => {
    const {columns, visibleColumnNames, data, toggleRow, selected, view, idColumn, history} = props;
    const classes = useStyles();
    const visibleColumns = columns.filter(column => visibleColumnNames.includes(column.name));
    const isCollectionViewTable = isFilesView(view);
    const valueSetColumns = columns.filter(c => c.type === 'Set').map((c) => c.name);
    const termSetColumns = columns.filter(c => c.type === 'TermSet').map((c) => c.name);
    const dataLinkColumn = columns.find(c => c.type === 'dataLink');
    const rows = idColumn && mergeRows(data.rows, idColumn.name, valueSetColumns, termSetColumns);

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
        let value = row[column.name];
        if (value instanceof Array) {
            value = value.join(', ');
        }
        let displayValue;
        if (column.type === 'dataLink') {
            displayValue = !value ? 0 : value.length;
        } else if (column.type === 'Date') {
            displayValue = formatDateTime(value);
        } else if (['Set'].includes(column.type) && value instanceof Array) {
            displayValue = value;
        } else if (['TermSet'].includes(column.type) && row[`${column.name}.label`] instanceof Array) {
            displayValue = row[`${column.name}.label`].join(', ');
        } else {
            displayValue = row[`${column.name}.label`] || value;
        }
        if (displayValue) {
            displayValue = `${displayValue}`;
        }
        return (
            <TableCell key={column.name}>
                {row[`${column.name}.label`] ? (
                    <IriTooltip
                        key={column.name}
                        enterDelay={TOOLTIP_ENTER_DELAY}
                        title={<Iri iri={value} />}
                    >
                        <span className={classes.cellContents}>{displayValue}</span>
                    </IriTooltip>
                ) : (
                    <span className={classes.cellContents}>{displayValue}</span>
                )}
            </TableCell>
        );
    };

    return (
        <Table data-testid="results-table" size="small">
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
                            row[idColumn.name],
                            row[`${idColumn.name}.label`],
                            dataLinkColumn ? row[dataLinkColumn.name] : []
                        )}
                        onDoubleClick={() => handleResultDoubleClick(row[idColumn.name])}
                    >
                        {visibleColumns.map(column => renderTableCell(row, column))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default MetadataViewTable;
