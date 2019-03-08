import React from 'react';
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, Typography, Icon,
    withStyles, Paper, Grid, Checkbox
} from "@material-ui/core";
import filesize from 'filesize';

import {DateTime} from "../common";
import styles from './FileList.styles';

class FileList extends React.Component {
    state = {
        hoveredFileName: ''
    }

    toggleHover = (hoveredFileName) => {
        this.setState({hoveredFileName});
    }

    render() {
        const {classes, files, onPathClick, onPathDoubleClick, selectionEnabled, onAllSelection} = this.props;

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
                            <TableCell style={{padding: 10}}>Name</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="right">Last Modified</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((file) => {
                            const item = selectionEnabled ? file.item : file;
                            const checkboxVisibility = this.state.hoveredFileName === item.filename || file.selected ? 'visible' : 'hidden';

                            return (
                                <TableRow
                                    hover
                                    key={item.filename}
                                    selected={selectionEnabled && file.selected}
                                    onDoubleClick={() => onPathDoubleClick(item)}
                                    onMouseEnter={() => this.toggleHover(item.filename)}
                                    onMouseLeave={() => this.toggleHover('')}
                                >
                                    {
                                        selectionEnabled ? (
                                            <TableCell
                                                padding="none"
                                                onClick={() => onPathClick(item)}
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
                                    <TableCell style={{padding: 10}}>
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
    }
}

export default withStyles(styles)(FileList);
