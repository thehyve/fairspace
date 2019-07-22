import React, {useState} from 'react';
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, Typography, Icon,
    withStyles, Paper, Grid, Checkbox, TableSortLabel
} from "@material-ui/core";
import filesize from 'filesize';

import {DateTime} from "../common";
import styles from './FileList.styles';
import useSorting from "../common/useSorting";

const FileList = ({
    classes, files, onPathCheckboxClick, onPathDoubleClick,
    selectionEnabled, onAllSelection, onPathHighlight
}) => {
    const [hoveredFileName, setHoveredFileName] = useState('');

    const columns = {
        name: {
            valueExtractor: f => f.item.basename,
            label: 'Name'
        },
        size: {
            valueExtractor: f => f.item.size,
            label: 'Size'
        },
        lastmodified: {
            valueExtractor: f => f.item.lastmod,
            label: 'Last modified'
        }
    };

    const {orderedItems, orderAscending, orderBy, toggleSort} = useSorting(files, columns);

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
                    {orderedItems.map((file) => {
                        const item = file.item;
                        const checkboxVisibility = hoveredFileName === item.filename || file.selected ? 'visible' : 'hidden';

                        return (
                            <TableRow
                                hover
                                key={item.filename}
                                selected={selectionEnabled && file.selected}
                                onClick={() => onPathHighlight(item)}
                                onDoubleClick={() => onPathDoubleClick(item)}
                                onMouseEnter={() => setHoveredFileName(item.filename)}
                                onMouseLeave={() => setHoveredFileName('')}
                            >
                                {
                                    selectionEnabled ? (
                                        <TableCell
                                            padding="none"
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            onClick={(e) => {e.stopPropagation(); onPathCheckboxClick(item);}}
                                        >
                                            <Checkbox style={{visibility: checkboxVisibility}} checked={file.selected} />
                                        </TableCell>
                                    ) : null
                                }

                                <TableCell align="left" padding="checkbox">
                                    <Icon>
                                        {item.type === 'directory' ? 'folder_open' : 'note_open'}
                                    </Icon>
                                </TableCell>
                                <TableCell padding="none">
                                    {item.basename}
                                </TableCell>
                                <TableCell padding="none" align="right">
                                    {item.type === 'file' ? filesize(item.size) : ''}
                                </TableCell>
                                <TableCell padding="checkbox" align="right">
                                    {item.lastmod ? <DateTime value={item.lastmod} /> : null}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(FileList);
