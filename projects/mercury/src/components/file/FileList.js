import React from 'react';

import {compose} from "redux";
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, Typography, Icon,
    withStyles, Paper, Grid
} from "@material-ui/core";
import filesize from 'filesize';

import {ButtonWithVerification, RenameButton, DateTime} from "../common";
import styles from './FileList.styles';

class FileList extends React.Component {
    state = {
        hoveredFileName: null
    }

    toggleHover = (hoveredFileName) => {
        this.setState({hoveredFileName});
    }

    render() {
        const {classes, files, selectedPaths, onPathClick,
            onPathDoubleClick, onRename, readonly, onDelete} = this.props;

        if (!files || files.length === 0 || files[0] === null) {
            return (
                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" style={{textAlign: 'center'}}>Empty directory</Typography>
                    </Grid>
                </Grid>
            );
        }

        const selectedFilenames = selectedPaths || [];

        return (
            <Paper className={classes.fileListContainer}>
                <Table padding="dense">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="right">Last Modified</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((file) => {
                            const selected = selectedFilenames.includes(file.filename);
                            const visibility = this.state.hoveredFileName !== file.filename ? 'hidden' : 'visible';

                            return (
                                <TableRow
                                    hover
                                    key={file.filename}
                                    className={selected ? classes.tableRowSelected : ''}
                                    onClick={() => onPathClick(file)}
                                    onDoubleClick={() => onPathDoubleClick(file)}
                                    onMouseEnter={() => this.toggleHover(file.filename)}
                                    onMouseLeave={() => this.toggleHover('')}
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
                                    <TableCell padding="none" align="right">
                                        {file.lastmod ? <DateTime value={file.lastmod} /> : null}
                                    </TableCell>
                                    <TableCell padding="none" align="right">
                                        <Grid
                                            container
                                            style={{visibility}}
                                        >
                                            <Grid
                                                item
                                                xs={6}
                                            >
                                                {onRename
                                                    ? (
                                                        <RenameButton
                                                            currentName={file.basename}
                                                            aria-label={`Rename ${file.basename}`}
                                                            title={`Rename ${file.basename}`}
                                                            onRename={newName => onRename(file, newName)}
                                                            disabled={readonly}
                                                        >
                                                            <Icon fontSize="small">border_color</Icon>
                                                        </RenameButton>
                                                    ) : null}
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                            >
                                                {onDelete
                                                    ? (
                                                        <ButtonWithVerification
                                                            aria-label={`Delete ${file.basename}`}
                                                            title={`Delete ${file.basename}`}
                                                            onClick={() => onDelete(file)}
                                                            disabled={readonly}
                                                        >
                                                            <Icon fontSize="small">delete</Icon>
                                                        </ButtonWithVerification>
                                                    ) : null}
                                            </Grid>
                                        </Grid>
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

export default compose(withStyles(styles))(FileList);
