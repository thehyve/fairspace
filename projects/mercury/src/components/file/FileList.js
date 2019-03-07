import React from 'react';
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, Typography, Icon,
    withStyles, Paper, Grid
} from "@material-ui/core";
import filesize from 'filesize';

import {DateTime} from "../common";
import styles from './FileList.styles';

const fileList = ({classes, files, selectedPaths = [], onPathClick, onPathDoubleClick}) => {
    if (!files || files.length === 0 || files[0] === null) {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{textAlign: 'center'}}>Empty directory</Typography>
                </Grid>
            </Grid>
        );
    }

    return (
        <Paper className={classes.root}>
            <Table padding="dense">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Size</TableCell>
                        <TableCell align="right">Last Modified</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map((file) => {
                        const selected = selectedPaths.includes(file.filename);

                        return (
                            <TableRow
                                hover
                                key={file.filename}
                                className={selected ? classes.tableRowSelected : ''}
                                onClick={() => onPathClick(file)}
                                onDoubleClick={() => onPathDoubleClick(file)}
                            >
                                <TableCell>
                                    <Icon>
                                        {file.type === 'directory' ? 'folder_open' : 'note_open'}
                                    </Icon>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {file.basename}
                                </TableCell>
                                <TableCell padding="none" align="right">
                                    {file.type === 'file' ? filesize(file.size) : ''}
                                </TableCell>
                                <TableCell align="right">
                                    {file.lastmod ? <DateTime value={file.lastmod} /> : null}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(fileList);
