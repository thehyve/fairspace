// @flow
import React from 'react';
import {IconButton, Table, TableBody, TableCell, TableRow, Typography, withStyles} from '@material-ui/core';
import {Close, Person} from "@material-ui/icons";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import PropTypes from "prop-types";
import {accessLevels} from "../collections/CollectionAPI";
import type {AccessLevel, Permission, Principal} from "../collections/CollectionAPI";

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
    },
    accessDropdown: {
        fontSize: 14
    }
};

export const UserPermissionsTable = ({selectedPermissions = [], emptyPermissionsText, workspaceUsers = [], currentUser,
    handleChangePermission, handleDeletePermission, canManage, classes}) => {
    if (selectedPermissions.length === 0) {
        return (
            <Typography variant="body2" className={classes.emptyPermissions}>
                {emptyPermissionsText}
            </Typography>
        );
    }

    const availableWorkspaceMemberAccessLevels = accessLevels.filter(a => a !== "None" && a !== "List");
    const getAccessLevelsForPrincipal: AccessLevel[] = (selectedPrincipal: Principal) => {
        if (workspaceUsers.some(wu => wu.iri === selectedPrincipal.iri)) {
            return availableWorkspaceMemberAccessLevels;
        }
        return ['Read'];
    };

    const canManagePermission:boolean = (permission: Permission) => (
        canManage && currentUser && permission.iri !== currentUser.iri
    );

    const renderAccessLevelDropdown = (selectedPermission: Permission, accessLevelOptions: AccessLevel[]) => (
        <FormControl>
            <Select
                value={selectedPermission.access}
                onChange={v => handleChangePermission({
                    ...selectedPermission,
                    access: v.target.value
                })}
                className={classes.accessDropdown}
            >
                {accessLevelOptions.map(access => (
                    <MenuItem key={access} value={access}>
                        <span>{access}</span>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    return (
        <Table size="small" className={classes.table}>
            <TableBody className={classes.tableBody}>
                {
                    selectedPermissions.map(p => {
                        const accessLevelOptions: AccessLevel[] = getAccessLevelsForPrincipal(p);
                        const canManageCurrentPermission = canManagePermission(p);
                        return (
                            <TableRow key={p.iri} className={classes.tableRow}>
                                <TableCell style={{width: 30}}>
                                    <Person />
                                </TableCell>
                                <TableCell
                                    className={classes.nameCell}
                                    data-testid="permission"
                                >
                                    <span>{p.name}</span>
                                </TableCell>
                                <TableCell style={{width: 85}}>
                                    {canManageCurrentPermission && accessLevelOptions.length > 1 ? (
                                        renderAccessLevelDropdown(p, accessLevelOptions)
                                    ) : (
                                        <span>{p.access}</span>
                                    )}
                                </TableCell>
                                <TableCell style={{width: 40}} className={classes.iconCellButton}>
                                    <IconButton
                                        onClick={() => handleDeletePermission(p)}
                                        disabled={!canManageCurrentPermission}
                                    >
                                        <Close />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        );
                    })
                }
            </TableBody>
        </Table>
    );
};

UserPermissionsTable.propTypes = {
    classes: PropTypes.object.isRequired,
    selectedPermissions: PropTypes.array,
    emptyPermissionsText: PropTypes.string,
    workspaceUsers: PropTypes.array,
    currentUser: PropTypes.object,
    handleChangePermission: PropTypes.func.isRequired,
    handleDeletePermission: PropTypes.func.isRequired,
    canManage: PropTypes.bool
};

export default withStyles(styles)(UserPermissionsTable);
