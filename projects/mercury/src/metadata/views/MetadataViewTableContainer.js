import React, {useContext, useEffect, useState} from 'react';
import {
    Button,
    CircularProgress,
    FormControlLabel,
    IconButton,
    Paper,
    TableContainer,
    TablePagination,
    Typography,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {useHistory} from "react-router-dom";
import {Addchart, ViewColumn, Check} from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import Popover from "@mui/material/Popover";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import GetAppIcon from "@mui/icons-material/GetApp";
import FormGroup from "@mui/material/FormGroup";
import useDeepCompareEffect from "use-deep-compare-effect";

import type {MetadataViewColumn, MetadataViewFilter} from "./MetadataViewAPI";
import MessageDisplay from "../../common/components/MessageDisplay";
import type {MetadataViewEntityWithLinkedFiles} from "./metadataViewUtils";
import useViewData from "./UseViewData";
import MetadataViewTable from "./MetadataViewTable";
import useStateWithLocalStorage from "../../common/hooks/UseLocalStorage";
import {Collection} from "../../collections/CollectionAPI";
import LoadingOverlayWrapper from '../../common/components/LoadingOverlayWrapper';
import {isNonEmptyValue} from "../../common/utils/genericUtils";
import MetadataViewActiveTextFilters from "./MetadataViewActiveTextFilters";
import TablePaginationActions from "../../common/components/TablePaginationActions";
import UserContext from "../../users/UserContext";
import FeaturesContext from "../../common/contexts/FeaturesContext";
import ProgressButton from "../../common/components/ProgressButton";
import {ANALYSIS_EXPORT_SUBPATH, ExtraLocalStorage} from "../../file/FileAPI";
import ErrorDialog from "../../common/components/ErrorDialog";

type MetadataViewTableContainerProperties = {
    columns: MetadataViewColumn[];
    filters: MetadataViewFilter[];
    textFiltersObject: Object;
    setTextFiltersObject: () => {};
    toggleRow: () => {};
    view: string;
    collections: Collection[];
    locationContext: string;
    selected: MetadataViewEntityWithLinkedFiles;
    hasInactiveFilters: boolean;
    classes: any;
};

const styles = () => ({
    tableContents: {
        "minHeight": '200px',
        "maxHeight": 'calc(100vh - 270px)',
        "overflowY": 'auto',
        "overflowX": 'auto',
        '& .MuiTableCell-stickyHeader': {
            backgroundColor: "white"
        }
    },
    footerButtonDiv: {
        display: 'flex',
        padding: 0,
        margin: 4,
    },
    exportButton: {
        width: 130,
        height: 40,
        margin: 3,
        fontSize: 10,
        padding: 2
    },
    tableFooter: {
        flex: 1,
    },
    tableSettings: {
        position: 'relative',
        marginTop: -50,
        marginRight: 10,
        float: 'right',
        maxWidth: 50
    },
    viewColumnsFormControl: {
        padding: 10
    },
    messageBox: {
        padding: 5
    }
});

const LOCAL_STORAGE_METADATA_TABLE_ROWS_NUM_KEY = 'FAIRSPACE_METADATA_TABLE_ROWS_NUM';
const SESSION_STORAGE_VISIBLE_COLUMNS_KEY_PREFIX = 'FAIRSPACE_METADATA_VISIBLE_COLUMNS';

export const MetadataViewTableContainer = (props: MetadataViewTableContainerProperties) => {
    const {view, filters, columns, hasInactiveFilters, locationContext, classes} = props;
    const {textFiltersObject, setTextFiltersObject} = props;
    const {currentUser} = useContext(UserContext);

    const {isFeatureEnabled} = useContext(FeaturesContext);
    const exportToAnalysisEnabled = isFeatureEnabled('ExtraStorage');
    const [exportToAnalysisLoading, setExportToAnalysisLoading] = useState(false);
    const [currentSelectionExported, setCurrentSelectionExported] = useState(false);

    const [page, setPage] = useState(0);
    const [visibleColumnNames, setVisibleColumnNames] = useStateWithLocalStorage(
        `${SESSION_STORAGE_VISIBLE_COLUMNS_KEY_PREFIX}_${view.toUpperCase()}`,
        columns.map(c => c.name)
    );
    const [rowsPerPage, setRowsPerPage] = useStateWithLocalStorage(LOCAL_STORAGE_METADATA_TABLE_ROWS_NUM_KEY, 10);
    const [anchorEl, setAnchorEl] = useState(null);

    const idColumn = columns.find(c => c.type === 'Identifier'); // first column of id type
    const columnSelectorOpen = Boolean(anchorEl);
    const history = useHistory();

    const {data, count, error, loading, loadingCount, refreshDataOnly} = useViewData(view, filters, textFiltersObject, locationContext, rowsPerPage);
    const [rowCheckboxes, setRowCheckboxes] = React.useState({});

    const resetRowCheckboxes = () => {
        setRowCheckboxes(() => ({}));
    };

    const setRowCheckboxState = (id: string, checked: boolean) => {
        if (rowCheckboxes) {
            setRowCheckboxes(oldState => {
                const newState = {...oldState};
                newState[id] = checked;
                return newState;
            });
        }
    };

    const handleChangePage = (e, p) => {
        setPage(p);
        refreshDataOnly(p, rowsPerPage);
    };

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(e.target.value);
        setPage(0);
        refreshDataOnly(0, e.target.value);
    };

    const handleVisibleColumnsChange = (event) => {
        if (event.target.checked) {
            setVisibleColumnNames([...visibleColumnNames, event.target.name]);
        } else if (event.target.name !== idColumn.name) {
            setVisibleColumnNames([...visibleColumnNames.filter(cs => cs !== event.target.name)]);
        }
    };

    const handleColumnSelectorButtonClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleColumnSelectorClose = () => {
        setAnchorEl(null);
    };

    const getCsvHeader = () => {
        let header = "id";

        if (data && data.rows) {
            header += ";";
            header += visibleColumnNames.join(";");
        }

        return header;
    };

    // each row contains attributes with values. Each value is a dictionary with 'label' and 'value'
    const getCsvValuesForAttribute = (row, attribute) => {
        if (row[attribute] === undefined) {
            return "-";
        }
        return Object.values(row[attribute])
            .map(value => ((value && value.label) ?? "-").replaceAll(";", ".,"))
            .join(",");
    };

    const getCsvValues = () => {
        let values = "";
        if (Object.keys(rowCheckboxes).length > 0) {
            data.rows.forEach(row => {
                const rowKey = row[idColumn.name][0].value;
                if (Object.keys(rowCheckboxes).includes(rowKey) && rowCheckboxes[rowKey]) {
                    values += '\n' + rowKey;
                    visibleColumnNames.forEach(attribute => {
                        values += ";" + getCsvValuesForAttribute(row, attribute);
                    });
                }
            });
        }
        return values;
    };

    const createCsvBlob = (): Blob => {
        let csvFile = getCsvHeader();
        csvFile += getCsvValues();
        return new Blob([csvFile], {type: 'text/csv;charset=utf-8;'});
    };

    const exportTable = () => {
        const blob = createCsvBlob();
        const fileName = "fairspace_export.csv";
        const link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style = "visibility:hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const saveTableExtraStorage = () => {
        setExportToAnalysisLoading(true);
        let csvFile = getCsvHeader();
        csvFile += getCsvValues();
        const fileName = `fairspace_export_${currentUser.id}.csv`;
        ExtraLocalStorage.upload(csvFile, fileName, ANALYSIS_EXPORT_SUBPATH, true)
            .then(() => setCurrentSelectionExported(true))
            .catch((err: Error) => (ErrorDialog.showError('Could not export the selection to analysis', err.message)))
            .finally(() => (setExportToAnalysisLoading(false)));
    };

    const renderMessages = () => (
        <div className={classes.messageBox}>
            {count.timeout && (
                <MessageDisplay small message="The count request timed out." />
            )}
            {hasInactiveFilters && (
                <MessageDisplay color="primary" isError={false} small message="Apply filters to see data matching your current selection." />
            )}
        </div>
    );

    const renderColumnSelector = () => (
        <Popover
            open={columnSelectorOpen}
            onClose={handleColumnSelectorClose}
            anchorEl={anchorEl}
            anchorOrigin={{vertical: 'center', horizontal: 'left'}}
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
        >
            <FormControl className={classes.viewColumnsFormControl}>
                <Typography variant="caption">
                    Show/hide columns
                </Typography>
                <FormGroup>
                    {columns.map((column) => (
                        <FormControlLabel
                            key={column.name}
                            control={(
                                <Checkbox
                                    checked={visibleColumnNames.includes(column.name)}
                                    disabled={column.name === idColumn.name}
                                    onChange={handleVisibleColumnsChange}
                                    name={column.name}
                                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                                />
                            )}
                            label={column.title}
                        />
                    ))}
                </FormGroup>
            </FormControl>
        </Popover>
    );

    const renderTableSettings = () => (
        <div className={classes.tableSettings}>
            <IconButton
                aria-label="Show/hide columns"
                title="Show/hide columns"
                onClick={handleColumnSelectorButtonClick}
                size="medium"
            >
                <ViewColumn color="primary" />
            </IconButton>
            {renderColumnSelector()}
        </div>
    );

    const labelDisplayedRows = ({from, to, count: totalCount, countIsLoading}) => (
        <span>
            <Typography variant="body2" component="span" display="inline">{from}-{to} of </Typography>
            <Typography variant="body2" component="span" display="inline" style={{fontWeight: "bold"}}>
                {totalCount !== undefined && totalCount !== -1 ? totalCount.toLocaleString() : ("more than " + to)}
                {countIsLoading && <CircularProgress size={14} style={{marginLeft: 3}} />}
            </Typography>
        </span>
    );

    const renderMetadataViewTable = () => {
        if (error && error.message) {
            return <MessageDisplay message={error.message} />;
        }

        if (count.count === 0 && !data.timeout && !count.timeout) {
            return <MessageDisplay message="No results found." />;
        }
        if (data && data.timeout) {
            return <MessageDisplay isError message="The data request timed out." />;
        }
        return (
            <MetadataViewTable
                {...props}
                visibleColumnNames={visibleColumnNames}
                idColumn={idColumn}
                data={data}
                loading={!data || loading}
                history={history}
                textFiltersObject={textFiltersObject}
                setTextFiltersObject={setTextFiltersObject}
                checkboxes={rowCheckboxes}
                setCheckboxState={setRowCheckboxState}
            />
        );
    };

    useEffect(() => {
        setPage(0);
    }, [filters]);

    useEffect(() => {
        resetRowCheckboxes();
    }, [data]);

    useDeepCompareEffect(() => {
        if (rowCheckboxes && Object.keys(rowCheckboxes).length > 0 && Object.values(rowCheckboxes).includes(true)) {
            setCurrentSelectionExported(false);
        }
    }, [rowCheckboxes]);

    const checkedCount = (Object.values(rowCheckboxes) ? Object.values(rowCheckboxes).reduce((sum, item) => (item === true ? sum + 1 : sum), 0) : 0);

    return (
        <Paper>
            {renderTableSettings()}
            <LoadingOverlayWrapper loading={!data || loading}>
                <MetadataViewActiveTextFilters
                    textFiltersObject={textFiltersObject}
                    setTextFiltersObject={setTextFiltersObject}
                    columns={columns}
                />
                <TableContainer className={classes.tableContents}>
                    {renderMessages()}
                    {renderMetadataViewTable()}
                </TableContainer>
                <div className={classes.footerButtonDiv}>
                    <Button
                        color="primary"
                        className={classes.exportButton}
                        onClick={exportTable}
                        variant="contained"
                        endIcon={<GetAppIcon fontSize="small" />}
                        disabled={checkedCount === 0}
                    >
                        Download ({checkedCount})
                    </Button>
                    {exportToAnalysisEnabled && (
                        <ProgressButton active={exportToAnalysisLoading}>
                            <Button
                                color="primary"
                                className={classes.exportButton}
                                onClick={saveTableExtraStorage}
                                variant="contained"
                                endIcon={(currentSelectionExported ? <Check fontSize="small" /> : <Addchart fontSize="small" />)}
                                disabled={checkedCount === 0 || currentSelectionExported}
                            >
                                {currentSelectionExported ? "Exported" : `Export (${checkedCount})`}
                            </Button>
                        </ProgressButton>
                    )}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={count && isNonEmptyValue(count.count) ? count.count : -1}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        className={classes.tableFooter}
                        labelDisplayedRows={(d) => labelDisplayedRows({...d, countIsLoading: loadingCount})}
                        ActionsComponent={TablePaginationActions}
                    />
                </div>
            </LoadingOverlayWrapper>
        </Paper>
    );
};

export default withStyles(styles)(MetadataViewTableContainer);
