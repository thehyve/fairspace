import React, {useState} from 'react';
import {Column, InfiniteLoader, Table} from 'react-virtualized';
import 'react-virtualized/styles.css';
import {IconButton, withStyles} from "@material-ui/core";
import {SettingsBackupRestore} from "@material-ui/icons";
import TableCell from "@material-ui/core/TableCell";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import filesize from "filesize";
import Download from "mdi-material-ui/Download";
import useAsync from "../common/hooks/UseAsync";
import FileAPI from "./FileAPI";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import ConfirmationDialog from "../common/components/ConfirmationDialog";


const styles = (theme) => ({
    fileVersionDialog: {
        'height': 300,
        'width': 500,
        '& .ReactVirtualized__Table__headerRow': {
            flip: false,
            paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
        },
        '& .ReactVirtualized__Table__row': {
            outline: 0
        },
        '& .ReactVirtualized__Table__Grid': {
            outline: 0
        },
    },
    flexContainer: {
        display: 'flex',
        boxSizing: 'border-box',
    },
    tableRow: {
        cursor: 'pointer',
    },
    tableRowHover: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    tableCell: {
        flex: 1,
        borderBottom: 'none',
    },
    tableActionCell: {
        margin: 0,
        padding: 0
    },
    tableHeaderRow: {
        'text-transform': 'none'
    }
});

const columns = [
    {
        width: 70,
        label: 'Version',
        dataKey: 'version',
    },
    {
        width: 300,
        label: 'Modified',
        dataKey: 'lastmod'
    },
    {
        width: 100,
        label: 'Size',
        dataKey: 'size',
    }
];

const FileVersionsList = ({selectedFile, onRevertVersion, classes}) => {
    const {data: selectedFileDetails, error, loading} = useAsync(
        () => FileAPI.stat(selectedFile.filename, false)
    );
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState();
    const [loadedData, setLoadedData] = useState([{}]);

    if (error) {
        return (<MessageDisplay message="An error occurred while fetching file history." />);
    }
    if (loading) {
        return (<LoadingInlay />);
    }

    const selectedFileVersion = selectedFileDetails && parseInt(selectedFileDetails.version, 10);
    if (!selectedFileVersion || selectedFileVersion === 1) {
        return (<div>No previous version found.</div>);
    }

    const handleOpenVersion = (version) => {
        FileAPI.open(selectedFile.filename, version);
    };

    const handleRevertToVersion = (version) => {
        setSelectedVersion(version);
        setShowConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setShowConfirmDialog(false);
    };

    const renderConfirmationDialog = () => {
        if (!showConfirmDialog) {
            return null;
        }
        const content = `Are you sure you want to revert "${selectedFile.filename}" to version "${selectedVersion}"`;

        return (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={content}
                dangerous
                agreeButtonText="Revert"
                onAgree={() => onRevertVersion(selectedVersion)}
                onDisagree={handleCloseConfirmDialog}
                onClose={handleCloseConfirmDialog}
            />
        );
    };

    const formatCellData = (cellData, dataKey) => (cellData && dataKey === "size" ? filesize(cellData) : cellData);

    const renderCell = (cellData, rowIndex, dataKey) => (
        <TableCell
            component="div"
            variant="body"
            className={classes.tableCell}
        >
            {formatCellData(cellData, dataKey)}
        </TableCell>
    );

    function getDownloadLink(version) {
        return FileAPI.getDownloadLink(selectedFile.filename) + `?Version=${version}`;
    }

    const renderDownloadActionCell = (rowIndex) => (
        <TableCell align="right" className={`${classes.tableCell} ${classes.tableActionCell}`} variant="body" component="div">
            <IconButton
                title="Download this version"
                aria-label="Download this version"
                component="a"
                href={getDownloadLink(loadedData[rowIndex].version)}
                download
            >
                <Download />
            </IconButton>
        </TableCell>
    );

    const renderRevertActionCell = (rowIndex) => (
        <TableCell align="right" className={`${classes.tableCell} ${classes.tableActionCell}`} variant="body" component="div">
            <IconButton
                aria-label="Revert to this version"
                title="Revert to this version"
                onClick={() => handleRevertToVersion(loadedData[rowIndex].version)}
            >
                <SettingsBackupRestore />
            </IconButton>
        </TableCell>
    );

    const renderHeader = ({label}) => (
        <TableCell
            component="div"
            className={`${classes.tableCell} ${classes.tableHeaderRow}`}
            variant="head"
            align="left"
        >
            {label}
        </TableCell>
    );

    const getRowClassName = ({index}) => ([classes.tableRow, classes.flexContainer, {
        [classes.tableRowHover]: index !== -1
    }]);

    const isRowLoaded = ({index}) => !!loadedData[index];
    const isOnlyInitialRowLoaded: boolean = (loadedData.length === 1 && Object.keys(loadedData[0]).length === 0);

    const loadMoreRows = ({startIndex, stopIndex}) => {
        const fromVersion = startIndex === 1 ? startIndex : startIndex + 1;
        const toVersion = stopIndex + 1;
        FileAPI.showFileHistory(selectedFileDetails, fromVersion, toVersion)
            .then(res => {
                if (res) {
                    if (isOnlyInitialRowLoaded) {
                        setLoadedData([...res]);
                    } else {
                        setLoadedData([...loadedData, ...res]);
                    }
                }
            });
    };

    return (
        <div className={classes.fileVersionDialog}>
            <AutoSizer>
                {({height, width}) => (
                    <InfiniteLoader
                        isRowLoaded={isRowLoaded}
                        loadMoreRows={loadMoreRows}
                        rowCount={selectedFileVersion}
                        minimumBatchSize={1}
                        threshold={1}
                    >
                        {({onRowsRendered, registerChild}) => (
                            <Table
                                ref={registerChild}
                                rowHeight={50}
                                rowCount={loadedData.length}
                                width={width}
                                height={height}
                                headerHeight={35}
                                rowGetter={({index}) => loadedData[index]}
                                onRowsRendered={onRowsRendered}
                                rowClassName={getRowClassName}
                                onRowDoubleClick={({index}) => handleOpenVersion(loadedData[index].version)}
                            >
                                {columns.map((col) => (
                                    <Column
                                        key={col.dataKey}
                                        label={col.label}
                                        dataKey={col.dataKey}
                                        headerRenderer={renderHeader}
                                        className={classes.flexContainer}
                                        cellRenderer={({cellData, rowIndex}) => renderCell(cellData, rowIndex, col.dataKey)}
                                        width={col.width}
                                        align="left"
                                    />
                                ))}
                                <Column
                                    key="download"
                                    label=""
                                    dataKey="download"
                                    headerRenderer={renderHeader}
                                    className={classes.flexContainer}
                                    cellRenderer={({rowIndex}) => renderDownloadActionCell(rowIndex)}
                                    width={80}
                                />
                                <Column
                                    key="revert"
                                    label=""
                                    dataKey="revert"
                                    headerRenderer={renderHeader}
                                    className={classes.flexContainer}
                                    cellRenderer={({rowIndex}) => renderRevertActionCell(rowIndex)}
                                    width={80}
                                />
                            </Table>
                        )}
                    </InfiniteLoader>

                )}
            </AutoSizer>
            {renderConfirmationDialog()}
        </div>
    );
};

export default withStyles(styles)(FileVersionsList);
