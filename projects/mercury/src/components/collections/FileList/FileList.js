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
import ClickHandler from "../../../containers/ClickHandler/ClickHandler";
import ButtonWithVerification from "../buttons/ButtonWithVerification/ButtonWithVerification";
import RenameButton from "../buttons/RenameButton/RenameButton";
import DateTime from "../../generic/DateTime/DateTime";
import Bytes from "../../generic/Bytes/Bytes";
import styles from './FileList.styles';
import withHovered from "../../../containers/WithHovered/WithHovered";

class FileList extends React.Component {
    render() {
        // TODO: what is the point of this.props.files[0] === null?
        if (!this.props.files || this.props.files.length === 0 || this.props.files[0] === null) {
            return "No files";
        }
        const selectedFilenames = this.props.selectedPaths || [];
        return (
            <Paper className={this.props.classes.fileListContainer}>
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
                        {this.props.files.map((row, idx) => {
                            const selected = selectedFilenames.includes(row.filename);
                            return (
                                <ClickHandler
                                    component={TableRow}
                                    key={row.filename}
                                    selected={selected}
                                    className={selected ? this.props.classes.tableRowSelected : this.props.classes.tableRow}
                                    onSingleClick={() => this.props.onPathClick(row)}
                                    onDoubleClick={() => this.props.onPathDoubleClick(row)}
                                    onMouseOver={e => this.props.onItemMouseOver(idx, e)}
                                    onMouseOut={() => this.props.onItemMouseOut(idx)}
                                >
                                    <TableCell>
                                        <Icon>
                                            {row.type === 'directory' ? 'folder_open' : 'note_open'}
                                        </Icon>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.basename}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography noWrap>
                                            {row.type === 'file' ? <Bytes value={row.size} /> : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography noWrap>
                                            {row.lastmod ? <DateTime value={row.lastmod} /> : null}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Row
                                            style={{visibility: this.props.hovered !== idx ? 'hidden' : 'visible'}}
                                        >
                                            {this.props.onRename
                                                ? (
                                                    <RenameButton
                                                        currentName={row.basename}
                                                        aria-label={`Rename ${row.basename}`}
                                                        title={`Rename ${row.basename}`}
                                                        onRename={newName => this.props.onRename(row, newName)}
                                                        disabled={this.props.readonly}
                                                    >
                                                        <RenameBox />
                                                    </RenameButton>
                                                ) : null}
                                            {this.props.onDelete
                                                ? (
                                                    <ButtonWithVerification
                                                        aria-label={`Delete ${row.basename}`}
                                                        title={`Delete ${row.basename}`}
                                                        onClick={() => this.props.onDelete(row)}
                                                        disabled={this.props.readonly}
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
    }
}

export default compose(
    withStyles(styles),
    withHovered,
)(FileList);
