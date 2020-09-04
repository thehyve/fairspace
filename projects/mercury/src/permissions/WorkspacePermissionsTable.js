// @flow
import React from 'react';
import {IconButton, Table, TableBody, TableCell, TableRow, Tooltip, Typography, withStyles} from '@material-ui/core';
import {Close, Widgets} from "@material-ui/icons";
import PropTypes from "prop-types";

const styles = {
    table: {
        padding: 0
    },
    tableBody: {
        display: 'block',
        maxHeight: 150,
        overflow: 'auto'
    },
    tableRow: {
        display: 'block',
        height: 49,
        width: '100%'
    },
    iconCellButton: {
        paddingTop: 0,
        paddingBottom: 0,
        textAlign: "right"
    },
    emptyPermissions: {
        margin: 15,
        width: 350,
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
                            <TableCell width={30}>
                                <Widgets />
                            </TableCell>
                            <TableCell
                                width={355}
                                data-testid="permission"
                            >
                                <Tooltip title={p.name} placement="left-start" arrow>
                                    <Typography variant="body2" noWrap style={{width: 355}}>
                                        {p.name}
                                    </Typography>
                                </Tooltip>
                            </TableCell>
                            <TableCell width={10}>
                                <span>&nbsp;</span>
                            </TableCell>
                            <TableCell width={40} className={classes.iconCellButton}>
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
