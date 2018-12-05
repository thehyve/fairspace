import React from 'react';

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import ClickHandler from "../../../containers/ClickHandler/ClickHandler";
import ButtonWithVerification from "../buttons/ButtonWithVerification/ButtonWithVerification";
import RenameBox from "mdi-material-ui/RenameBox";
import RenameButton from "../buttons/RenameButton/RenameButton";
import {Row} from "simple-flexbox";
import DateTime from "../../generic/DateTime/DateTime";
import Bytes from "../../generic/Bytes/Bytes";
import styles from './FileList.styles';
import {withStyles} from '@material-ui/core/styles';
import withHovered from "../../../containers/WithHovered/WithHovered";
import {compose} from "redux";
import Paper from "@material-ui/core/Paper";

class FileList extends React.Component {
    render() {
        const props = this.props;

        if (!props.files || props.files.length === 0 || props.files[0] === null) {
            return "No files";
        } else {
            const selectedFilenames = props.selectedPaths || [];
            return (
                <Paper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell numeric>size</TableCell>
                                <TableCell numeric>Last Modified</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.files.map((row, idx) => {
                                const selected = selectedFilenames.includes(row.filename);
                                const classes = props.classes;
                                return (
                                    <ClickHandler
                                        component={TableRow}
                                        key={row.filename}
                                        selected={selected}
                                        className={selected ? classes.tableRowSelected : classes.tableRow}
                                        onSingleClick={() => props.onPathClick(row)}
                                        onDoubleClick={() => props.onPathDoubleClick(row)}
                                        onMouseOver={(e) => this.props.onItemMouseOver(idx, e)}
                                        onMouseOut={() => this.props.onItemMouseOut(idx)}
                                    >
                                        <TableCell>
                                            <Icon>{row.type === 'directory' ? 'folder_open' : 'note_open'}</Icon>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {row.basename}
                                        </TableCell>
                                        <TableCell numeric>
                                            <Typography noWrap={true}>
                                                {row.type === 'file' ? <Bytes value={row.size}/> : ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell numeric>
                                            <Typography noWrap={true}>
                                                {row.lastmod ? <DateTime value={row.lastmod}/> : null}
                                            </Typography>
                                        </TableCell>
                                        <TableCell numeric>
                                            <Row
                                                style={{visibility: this.props.hovered !== idx ? 'hidden' : 'visible'}}>
                                                {props.onRename ?
                                                    <RenameButton currentName={row.basename}
                                                                  aria-label={"Rename " + row.basename}
                                                                  title={"Rename " + row.basename}
                                                                  onRename={(newName) => props.onRename(row, newName)}
                                                                  disabled={props.readonly}>
                                                        <RenameBox/>
                                                    </RenameButton> : null}
                                                {props.onDelete ?
                                                    <ButtonWithVerification aria-label={"Delete " + row.basename}
                                                                            title={"Delete " + row.basename}
                                                                            onClick={() => props.onDelete(row)}
                                                                            disabled={props.readonly}>
                                                        <Icon>delete</Icon>
                                                    </ButtonWithVerification> : null}
                                            </Row>
                                        </TableCell>
                                    </ClickHandler>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
            )
        }
    }
}

export default compose(
    withStyles(styles),
    withHovered,
)(FileList)

