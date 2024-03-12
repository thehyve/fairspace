// @flow
import React from 'react';
import { IconButton, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Close, Person } from '@mui/icons-material';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';
import { accessLevels } from '../collections/CollectionAPI';
import type { AccessLevel, Permission, Principal } from '../collections/CollectionAPI';
import { collectionAccessIcon } from '../collections/collectionUtils';

const styles = {
    table: {
        padding: 0,
    },
    tableBody: {
        display: 'block',
        maxHeight: 150,
        overflowX: 'auto',
    },
    tableRow: {
        display: 'block',
        height: '99%',
        width: '100%',
    },
    iconCell: {
        padding: '0 0 0 8px',
        textAlign: 'right',
    },
    emptyPermissions: {
        margin: 15,
        width: 350,
        fontStyle: 'italic',
    },
    accessDropdown: {
        fontSize: 14,
    },
    accessIcon: {
        verticalAlign: 'middle',
        paddingRight: 5,
    },
    accessCell: {
        padding: 0,
        minWidth: 100,
    },
};

export const UserPermissionsTable = ({ selectedPermissions = [], emptyPermissionsText, workspaceUsers = [], currentUser,
    handleChangePermission, handleDeletePermission, canManage, classes }) => {
    if (selectedPermissions.length === 0) {
        return (
            <Typography variant="body2" className={classes.emptyPermissions}>
                {emptyPermissionsText}
            </Typography>
        );
    }

    const availableWorkspaceMemberAccessLevels = accessLevels.filter(a => a !== 'None' && a !== 'List');
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
                    access: v.target.value,
                })}
                className={classes.accessDropdown}
            >
                {accessLevelOptions.map(access => (
                    <MenuItem key={access} value={access}>
                        <span className={classes.accessIcon}>{collectionAccessIcon(access)}</span>
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
                                <TableCell width={25} className={classes.iconCell}>
                                    <Person />
                                </TableCell>
                                <TableCell width="100%" data-testid="permission">
                                    <Tooltip title={p.name} placement="left-start" arrow>
                                        <Typography variant="body2" noWrap style={{ width: 275 }}>
                                            {p.name}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell className={classes.accessCell}>
                                    {canManageCurrentPermission && accessLevelOptions.length > 1 ? (
                                        renderAccessLevelDropdown(p, accessLevelOptions)
                                    ) : (
                                        <div>
                                            <span className={classes.accessIcon}>{collectionAccessIcon(p.access)}</span>
                                            <span>{p.access}</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell width={40} className={classes.iconCell} align="right">
                                    <IconButton
                                        onClick={() => handleDeletePermission(p)}
                                        disabled={!canManageCurrentPermission}
                                        size="medium"
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
    canManage: PropTypes.bool,
};

export default withStyles(styles)(UserPermissionsTable);
