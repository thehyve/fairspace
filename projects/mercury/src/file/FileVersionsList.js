import React, {useState} from 'react';
import {Column, InfiniteLoader, Table} from 'react-virtualized';
import 'react-virtualized/styles.css';
import {IconButton, withStyles} from "@material-ui/core";
import {SettingsBackupRestore} from "@material-ui/icons";
import TableCell from "@material-ui/core/TableCell";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import filesize from "filesize";
import useAsync from "../common/hooks/UseAsync";
import FileAPI from "./FileAPI";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import ConfirmationDialog from "../common/components/ConfirmationDialog";


const styles = (theme) => ({
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    table: {
        // temporary right-to-left patch, waiting for
        // https://github.com/bvaughn/react-virtualized/issues/454
        '& .ReactVirtualized__Table__headerRow': {
            flip: false,
            paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
        },
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
    },
    noClick: {
        cursor: 'initial',
    },
});

const columns = [
    {
        width: 70,
        label: 'Version',
        dataKey: 'version',
    },
    {
        width: 280,
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
    const {data: selectedFileDetails, error, loading} = useAsync(() => FileAPI.stat(selectedFile.filename, false));
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState();

    const [loadedData, setLoadedData] = useState([{}]);

    if (error) {
        return (<MessageDisplay message="An error occurred while fetching file history." />);
    }
    if (loading) {
        return (<LoadingInlay />);
    }
    // eslint-disable-next-line eqeqeq
    if (!selectedFileDetails.version || selectedFileDetails.version == 1) {
        return (<div>No previous version found.</div>);
    }

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
            onDoubleClick={() => handleRevertToVersion(loadedData[rowIndex].version)}
        >
            {formatCellData(cellData, dataKey)}
        </TableCell>
    );

    const renderActionCell = (rowIndex) => (
        <TableCell padding="none" align="right">
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
            className={classes.tableCell}
            variant="head"
        >
            {label}
        </TableCell>
    );

    const isRowLoaded = ({index}) => !!loadedData[index];
    const isOnlyInitialRowLoaded: boolean = (loadedData.length === 1 && Object.keys(loadedData[0]).length === 0);

    const loadMoreRows = ({startIndex, stopIndex}) => {
        FileAPI.showFileHistory(selectedFileDetails, startIndex, stopIndex + 1)
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
        <div style={{height: 300, width: 500}}>
            <AutoSizer>
                {({height, width}) => (
                    <InfiniteLoader
                        isRowLoaded={isRowLoaded}
                        loadMoreRows={loadMoreRows}
                        rowCount={selectedFileDetails.version}
                        minimumBatchSize={1}
                        threshold={1}
                    >
                        {({onRowsRendered, registerChild}) => (
                            <Table
                                ref={registerChild}
                                className={classes.table}
                                rowHeight={50}
                                rowCount={loadedData.length}
                                width={width}
                                height={height}
                                headerHeight={35}
                                rowGetter={({index}) => loadedData[index]}
                                onRowsRendered={onRowsRendered}
                                rowClassName={classes.tableRow}
                                onRowDoubleClick={({index}) => handleRevertToVersion(loadedData[index].version)}
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
                                        padding={col.padding}
                                        align="left"
                                    />
                                ))}
                                <Column
                                    key="restore"
                                    label=""
                                    dataKey="restore"
                                    headerRenderer={renderHeader}
                                    className={classes.flexContainer}
                                    cellRenderer={({rowIndex}) => renderActionCell(rowIndex)}
                                    width={80}
                                    align="right"
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
