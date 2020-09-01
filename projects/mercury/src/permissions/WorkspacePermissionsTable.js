// @flow
import React from 'react';
import {IconButton, Table, TableBody, TableCell, TableRow, Typography, withStyles} from '@material-ui/core';
import {Close, Widgets} from "@material-ui/icons";
import PropTypes from "prop-types";

const styles = {
    table: {
        padding: 0
    },
    tableBody: {
        display: "block",
        overflow: "auto",
        maxHeight: 150
    },
    tableRow: {
        display: "table",
        width: "100%",
        height: 48,
    },
    nameCell: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    iconCellButton: {
        paddingTop: 0,
        paddingBottom: 0,
        textAlign: "right"
    },
    emptyPermissions: {
        margin: 10,
        fontStyle: 'italic'
    }
};

export const WorkspacePermissionsTable = ({selectedPermissions = [], emptyPermissionsText, handleDeleteSelectedPermission,
    canManage, classes}) => {
    if (selectedPermissions.length === 0) {
        return (
            <Typography variant="body2" className={classes.emptyPermissions}>
                {emptyPermissionsText}
            </Typography>
        );
    }

    return (
        <Table size="small" className={classes.table}>
            <TableBody className={classes.tableBody}>
                {
                    selectedPermissions.map(p => (
                        <TableRow key={p.iri} className={classes.tableRow}>
                            <TableCell style={{width: 30}}>
                                <Widgets />
                            </TableCell>
                            <TableCell
                                className={classes.nameCell}
                                data-testid="permission"
                            >
                                {p.name}
                            </TableCell>
                            <TableCell style={{width: 30}} className={classes.iconCellButton}>
                                {canManage && (
                                    <IconButton
                                        onClick={() => handleDeleteSelectedPermission(p)}
                                    >
                                        <Close />
                                    </IconButton>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
};

WorkspacePermissionsTable.propTypes = {
    classes: PropTypes.object.isRequired,
    selectedPermissions: PropTypes.array,
    emptyPermissionsText: PropTypes.string,
    handleDeleteSelectedPermission: PropTypes.func.isRequired,
    canManage: PropTypes.bool
};

export default withStyles(styles)(WorkspacePermissionsTable);
