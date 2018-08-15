import React from 'react';

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Icon from "@material-ui/core/Icon";
import ClickHandler from "../ClickHandler/ClickHandler";

function FileList(props) {
    if (!props.files || props.files.length === 0 || props.files[0] === null) {
        return "No files";
    } else {
        return (<Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell numeric>size</TableCell>
                        <TableCell numeric>Last Modified</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.files.map(row => {
                        return (
                            <ClickHandler
                                component={TableRow}
                                key={row.id}
                                selected={row.id === props.selectedPath}
                                onSingleClick={() => props.onPathClick(row)}
                                onDoubleClick={() => props.onPathDoubleClick(row)}>
                                <TableCell>
                                    <Icon>{row.type === 'dir' ? 'folder_open' : 'note_open'}</Icon>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell numeric>{row.size}</TableCell>
                                <TableCell numeric>{row.modifiedTime}</TableCell>
                            </ClickHandler>
                        );
                    })}
                </TableBody>
            </Table>)
    }
}

export default FileList;
