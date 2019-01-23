import React from 'react';

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import RenameBox from "mdi-material-ui/RenameBox";
import {Row} from "simple-flexbox";
import {withStyles} from '@material-ui/core/styles';
import {compose} from "redux";
import Paper from "@material-ui/core/Paper";
import filesize from 'filesize';
import {
    ClickHandler, ButtonWithVerification,
    RenameButton, withHovered, DateTime
} from "../common";
import styles from './FileList.styles';

const fileList = (props) => {
    if (!props.files || props.files.length === 0 || props.files[0] === null) {
        return "No files";
    }
    const selectedFilenames = props.selectedPaths || [];
    return (
        <Paper className={props.classes.fileListContainer}>
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
                    {props.files.map((file, idx) => {
                        const selected = selectedFilenames.includes(file.filename);
                        return (
                            <ClickHandler
                                component={TableRow}
                                key={file.filename}
                                selected={selected}
                                className={selected ? props.classes.tableRowSelected : props.classes.tableRow}
                                onSingleClick={() => props.onPathClick(file)}
                                onDoubleClick={() => props.onPathDoubleClick(file)}
                                onMouseOver={e => props.onItemMouseOver(idx, e)}
                                onMouseOut={() => props.onItemMouseOut(idx)}
                            >
                                <TableCell>
                                    <Icon>
                                        {file.type === 'directory' ? 'folder_open' : 'note_open'}
                                    </Icon>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {file.basename}
                                </TableCell>
                                <TableCell align="right">
                                    <Typography noWrap>
                                        {file.type === 'file' ? filesize(file.size) : ''}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography noWrap>
                                        {file.lastmod ? <DateTime value={file.lastmod} /> : null}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Row
                                        style={{visibility: props.hovered !== idx ? 'hidden' : 'visible'}}
                                    >
                                        {props.onRename
                                            ? (
                                                <RenameButton
                                                    currentName={file.basename}
                                                    aria-label={`Rename ${file.basename}`}
                                                    title={`Rename ${file.basename}`}
                                                    onRename={newName => props.onRename(file, newName)}
                                                    disabled={props.readonly}
                                                >
                                                    <RenameBox />
                                                </RenameButton>
                                            ) : null}
                                        {props.onDelete
                                            ? (
                                                <ButtonWithVerification
                                                    aria-label={`Delete ${file.basename}`}
                                                    title={`Delete ${file.basename}`}
                                                    onClick={() => props.onDelete(file)}
                                                    disabled={props.readonly}
                                                >
                                                    <Icon>delete</Icon>
                                                </ButtonWithVerification>
                                            ) : null}
                                    </Row>
                                </TableCell>
                            </ClickHandler>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default compose(withStyles(styles), withHovered)(fileList);
