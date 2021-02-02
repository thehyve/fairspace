import React, {useEffect, useMemo, useState} from 'react';
import {
    Checkbox,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Typography,
    withStyles
} from "@material-ui/core";
import {FolderOpen, NoteOutlined} from "@material-ui/icons";
import filesize from 'filesize';

import styles from './FileList.styles';
import {compareBy, formatDateTime, stableSort} from "../common/utils/genericUtils";
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";

const FileList = ({
    classes, files, onPathCheckboxClick, onPathDoubleClick,
    selectionEnabled, onAllSelection, onPathHighlight,
    showDeleted, preselectedFile
}) => {
    const [hoveredFileName, setHoveredFileName] = useState('');

    const columns = {
        name: {
            valueExtractor: f => f.basename,
            label: 'Name'
        },
        size: {
            valueExtractor: f => f.size,
            label: 'Size'
        },
        lastmodified: {
            valueExtractor: f => f.lastmod,
            label: 'Last modified'
        },
        dateDeleted: {
            valueExtractor: f => f.dateDeleted,
            label: 'Deleted'
        }
    };

    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(files, columns, 'name');
    const directoriesBeforeFiles = useMemo(
        () => stableSort(orderedItems, compareBy('type')),
        [orderedItems]
    );

    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(directoriesBeforeFiles);

    useEffect(() => {
        if (preselectedFile) {
            const preselectedFileIndex = directoriesBeforeFiles.findIndex(f => f.filename === preselectedFile);
            if (preselectedFileIndex > -1) {
                const preselectedFilePage = Math.floor(preselectedFileIndex / rowsPerPage);
                setPage(preselectedFilePage);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedFile]);

    if (!files || files.length === 0 || files[0] === null) {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{textAlign: 'center'}}>Empty directory</Typography>
                </Grid>
            </Grid>
        );
    }

    let checkboxHeader = null;

    if (selectionEnabled) {
        const numOfSelected = files.filter(f => f.selected).length;
        const allItemsSelected = files.length === numOfSelected;
        checkboxHeader = (
            <TableCell padding="none">
                <Checkbox
                    indeterminate={numOfSelected > 0 && numOfSelected < files.length}
                    checked={allItemsSelected}
                    onChange={(event) => onAllSelection(event.target.checked)}
                />
            </TableCell>
        );
    }

    return (
        <Paper className={classes.root}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {checkboxHeader}
                            <TableCell padding="none" />
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'name'}
                                    direction={orderAscending ? 'asc' : 'desc'}
                                    onClick={() => toggleSort('name')}
                                >
                                Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'size'}
                                    direction={orderAscending ? 'asc' : 'desc'}
                                    onClick={() => toggleSort('size')}
                                >
                                Size
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'lastmodified'}
                                    direction={orderAscending ? 'asc' : 'desc'}
                                    onClick={() => toggleSort('lastmodified')}
                                >
                                Last modified
                                </TableSortLabel>
                            </TableCell>
                            {showDeleted && (
                                <TableCell align="right">
                                    <TableSortLabel
                                        active={orderBy === 'dateDeleted'}
                                        direction={orderAscending ? 'asc' : 'desc'}
                                        onClick={() => toggleSort('dateDeleted')}
                                    >
                                    Deleted
                                    </TableSortLabel>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pagedItems.map((file) => {
                            const checkboxVisibility = hoveredFileName === file.filename || file.selected ? 'visible' : 'hidden';

                            return (
                                <TableRow
                                    hover
                                    key={file.filename}
                                    selected={file.selected}
                                    onClick={() => onPathHighlight(file)}
                                    onDoubleClick={() => onPathDoubleClick(file)}
                                    onMouseEnter={() => setHoveredFileName(file.filename)}
                                    onMouseLeave={() => setHoveredFileName('')}
                                    className={file.dateDeleted && classes.deletedFileRow}
                                >
                                    {
                                        selectionEnabled ? (
                                            <TableCell
                                                data-testid="checkbox-cell"
                                                padding="none"
                                                onDoubleClick={(e) => e.stopPropagation()}
                                                onClick={(e) => {e.stopPropagation(); onPathCheckboxClick(file);}}
                                            >
                                                <Checkbox
                                                    style={{visibility: checkboxVisibility}}
                                                    checked={file.selected}
                                                />
                                            </TableCell>
                                        ) : null
                                    }

                                    <TableCell style={{padding: 5}} align="left">
                                        {file.type === 'directory' ? <FolderOpen /> : <NoteOutlined />}
                                    </TableCell>
                                    <TableCell>
                                        {file.basename}
                                    </TableCell>
                                    <TableCell align="right">
                                        {file.type === 'file' ? filesize(file.size, {base: 10}) : ''}
                                    </TableCell>
                                    <TableCell align="right">
                                        {file.lastmod ? formatDateTime(file.lastmod) : null}
                                    </TableCell>
                                    {showDeleted && (
                                        <TableCell align="right">
                                            {file.dateDeleted ? formatDateTime(file.dateDeleted) : null}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={files.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={(e, p) => setPage(p)}
                    onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
                    style={{overflowX: "hidden"}}
                />
            </TableContainer>
        </Paper>
    );
};

export default withStyles(styles)(FileList);
