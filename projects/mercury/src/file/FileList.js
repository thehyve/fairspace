import React, {useState} from 'react';
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, Typography, Icon,
    withStyles, Paper, Grid, Checkbox, TableSortLabel, TablePagination
} from "@material-ui/core";
import filesize from 'filesize';

import {compareBy, formatDateTime, stableSort} from "../common/utils/genericUtils";
import styles from './FileList.styles';
import useSorting from "../common/hooks/UseSorting";
import usePagination from "../common/hooks/UsePagination";

const FileList = ({
    classes, files, onPathCheckboxClick, onPathDoubleClick,
    selectionEnabled, onAllSelection, onPathHighlight
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
        }
    };

    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(files, columns, 'name');
    const directoriesBeforeFiles = stableSort(orderedItems, compareBy('type'));
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(directoriesBeforeFiles);

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
            <Table padding="dense">
                <TableHead>
                    <TableRow>
                        {checkboxHeader}
                        <TableCell padding="none" />
                        <TableCell padding="none">
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
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pagedItems.map((file) => {
                        const checkboxVisibility = hoveredFileName === file.filename || file.selected ? 'visible' : 'hidden';

                        return (
                            <TableRow
                                hover
                                key={file.filename}
                                selected={selectionEnabled && file.selected}
                                onClick={() => onPathHighlight(file)}
                                onDoubleClick={() => onPathDoubleClick(file)}
                                onMouseEnter={() => setHoveredFileName(file.filename)}
                                onMouseLeave={() => setHoveredFileName('')}
                            >
                                {
                                    selectionEnabled ? (
                                        <TableCell
                                            padding="none"
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            onClick={(e) => {e.stopPropagation(); onPathCheckboxClick(file);}}
                                        >
                                            <Checkbox style={{visibility: checkboxVisibility}} checked={file.selected} />
                                        </TableCell>
                                    ) : null
                                }

                                <TableCell align="left" padding="checkbox">
                                    <Icon>
                                        {file.type === 'directory' ? 'folder_open' : 'note_open'}
                                    </Icon>
                                </TableCell>
                                <TableCell padding="none">
                                    {file.basename}
                                </TableCell>
                                <TableCell padding="none" align="right">
                                    {file.type === 'file' ? filesize(file.size) : ''}
                                </TableCell>
                                <TableCell padding="checkbox" align="right">
                                    {file.lastmod ? formatDateTime(file.lastmod) : null}
                                </TableCell>
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
            />
        </Paper>
    );
};

export default withStyles(styles)(FileList);
