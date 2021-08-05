import React from 'react';
import {Link, Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {Link as RouterLink} from "react-router-dom";
import type {MetadataViewColumn, MetadataViewData} from "./MetadataViewAPI";
import {TextualValueTypes} from "./MetadataViewAPI";
import type {MetadataViewEntity, MetadataViewEntityWithLinkedFiles} from "./metadataViewUtils";
import {RESOURCES_VIEW} from "./metadataViewUtils";
import {formatDate} from "../../common/utils/genericUtils";
import type {Collection} from "../../collections/CollectionAPI";
import {collectionAccessIcon} from "../../collections/collectionUtils";
import {getPathFromIri, redirectLink} from "../../file/fileUtils";
import ColumnFilterInput from "../../common/components/ColumnFilterInput";

type MetadataViewTableProperties = {
    data: MetadataViewData;
    loading: boolean;
    columns: MetadataViewColumn[];
    visibleColumnNames: string[];
    idColumn: MetadataViewColumn;
    toggleRow: () => {};
    history: any;
    selected?: MetadataViewEntityWithLinkedFiles;
    view: string;
    collections: Collection[];
    textFiltersObject: Object;
    setTextFiltersObject: () => {};
};

const useStyles = makeStyles(() => ({
    headerCellContents: {
        verticalAlign: 'top',
        whiteSpace: 'nowrap',
    },
    cellContents: {
        verticalAlign: 'top',
        display: 'block',
        whiteSpace: 'nowrap',
        maxWidth: '40em',
        overflow: 'hidden',
        overflowWrap: 'break-word',
        textOverflow: 'ellipsis'
    }
}));

const CUSTOM_RESOURCE_COLUMNS = ['access', 'path'];
const RESOURCE_TYPE_COLUMN = `${RESOURCES_VIEW}_type`;

export const MetadataViewTable = (props: MetadataViewTableProperties) => {
    const {columns, visibleColumnNames, loading, data, toggleRow, selected, view, idColumn, history, collections} = props;
    const classes = useStyles();
    const {textFiltersObject, setTextFiltersObject} = props;
    const visibleColumns = columns.filter(column => visibleColumnNames.includes(column.name));
    const dataLinkColumn = columns.find(c => c.type === 'dataLink');
    const isResourcesView = view === RESOURCES_VIEW;

    const isCustomResourceColumn = (column: MetadataViewColumn) => (
        isResourcesView && CUSTOM_RESOURCE_COLUMNS.includes(column.name) && column.type === 'Custom'
    );

    const getAccess = (iri: string) => collections.find(c => c.iri === iri || iri.startsWith(c.iri + '/')).access;

    const getResourceType = (row: Map<string, any>) => (
        row[RESOURCE_TYPE_COLUMN] && row[RESOURCE_TYPE_COLUMN][0] && row[RESOURCE_TYPE_COLUMN][0].value
    );

    const handleResultSingleClick = (iri: string, label: string, linkedFiles: MetadataViewEntity[]) => {
        if (selected && selected.iri === iri) {
            toggleRow();
        } else {
            toggleRow({label, iri, linkedFiles: linkedFiles || []});
        }
    };

    const handleResultDoubleClick = (iri: string, row: Map<string, any>) => {
        if (isResourcesView) {
            history.push(redirectLink(iri, getResourceType(row)));
        }
    };

    const renderCustomResourceColumn = (row: Map<string, any>, column: MetadataViewColumn) => {
        const iri = row[idColumn.name][0].value;
        switch (column.name) {
            case 'access': {
                const access = getAccess(iri);
                return (
                    <TableCell key={column.name}>
                        {collectionAccessIcon(access)}
                    </TableCell>
                );
            }
            case 'path': {
                const path = getPathFromIri(iri);
                const type = getResourceType(row);
                return (
                    <TableCell key={column.name}>
                        <Link
                            to={redirectLink(iri, type)}
                            component={RouterLink}
                            color="inherit"
                            underline="hover"
                            className={classes.cellContents}
                        >
                            {path}
                        </Link>
                    </TableCell>
                );
            }
            default:
                return <TableCell />;
        }
    };

    const renderColumnFilter = (columnName: string) => {
        const filterValue = textFiltersObject[columnName];
        const setFilterValue = value => setTextFiltersObject({...textFiltersObject, [columnName]: value});
        return (
            <ColumnFilterInput placeholder="Filter" filterValue={filterValue} setFilterValue={setFilterValue} useApplyButton />
        );
    };

    const renderTableCell = (row: Map<string, any>, column: MetadataViewColumn) => {
        if (isCustomResourceColumn(column)) {
            return renderCustomResourceColumn(row, column);
        }

        const value = row[column.name];
        const displayValue = (value || []).map(v => ((column.type === 'Date') ? formatDate(v.value) : v.label)).join(', ');

        return (
            <TableCell key={column.name}>
                <span className={classes.cellContents}>{displayValue}</span>
            </TableCell>
        );
    };

    return (
        <Table data-testid="results-table" size="small" stickyHeader={!loading}>
            <TableHead>
                <TableRow>
                    {visibleColumns.map(column => (
                        <TableCell key={column.name} className={classes.headerCellContents}>
                            {column.title}
                            {(TextualValueTypes.includes(column.type)) && renderColumnFilter(column.name)}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {idColumn && data && data.rows && data.rows.map(row => (
                    <TableRow
                        className={classes.row}
                        key={row[idColumn.name][0].value}
                        hover={isResourcesView}
                        selected={selected && selected.iri === row[idColumn.name][0].value}
                        onClick={() => handleResultSingleClick(
                            row[idColumn.name][0].value,
                            row[idColumn.name][0].label,
                            dataLinkColumn ? row[dataLinkColumn.name] : []
                        )}
                        onDoubleClick={() => handleResultDoubleClick(row[idColumn.name][0].value, row)}
                    >
                        {visibleColumns.map(column => renderTableCell(row, column))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default MetadataViewTable;
