import React from 'react';
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, Typography, Icon,
    withStyles, Paper, Grid, Checkbox
} from "@material-ui/core";
import filesize from 'filesize';

import {DateTime} from "../common";
import styles from './FileList.styles';

const fileList = ({classes, files, onPathClick, onPathDoubleClick, onSelectAll, onDeselectAll}) => {
    if (!files || files.length === 0 || files[0] === null) {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{textAlign: 'center'}}>Empty directory</Typography>
                </Grid>
            </Grid>
        );
    }

    const handleAllSelectionChange = (event) => {
        if (event.target.checked) {
            onSelectAll();
        } else {
            onDeselectAll();
        }
    };

    const numOfSelected = files.filter(f => f.selected).length;
    const allItemsSelected = files.length === numOfSelected;

    return (
        <Paper className={classes.root}>
            <Table padding="dense">
                <TableHead>
                    <TableRow>
                        <TableCell padding="none">
                            <Checkbox
                                indeterminate={numOfSelected > 0 && numOfSelected < files.length}
                                checked={allItemsSelected}
                                onChange={handleAllSelectionChange}
                            />
                        </TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Size</TableCell>
                        <TableCell align="right">Last Modified</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map(({item, selected}) => (
                        <TableRow
                            hover
                            key={item.filename}
                            selected={selected}
                            onClick={() => onPathClick(item)}
                            onDoubleClick={() => onPathDoubleClick(item)}
                        >
                            <TableCell padding="none">
                                <Checkbox checked={selected} />
                            </TableCell>
                            <TableCell>
                                <Grid
                                    container
                                    spacing={16}
                                    alignItems="center"
                                >
                                    <Grid item>
                                        <Icon>
                                            {item.type === 'directory' ? 'folder_open' : 'note_open'}
                                        </Icon></Grid>
                                    <Grid item>
                                        {item.basename}
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell padding="none" align="right">
                                {item.type === 'file' ? filesize(item.size) : ''}
                            </TableCell>
                            <TableCell align="right">
                                {item.lastmod ? <DateTime value={item.lastmod} /> : null}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(fileList);
