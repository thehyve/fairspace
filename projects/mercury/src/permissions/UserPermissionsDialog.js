import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {withStyles} from '@material-ui/core/styles';
import {IconButton, Table, TableBody, TableCell, TableRow, Typography} from "@material-ui/core";
import {Close, Person} from "@material-ui/icons";
import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import PermissionCandidateSelect from "./PermissionCandidateSelect";
import type {AccessLevel, Permission} from "../collections/CollectionAPI";
import {accessLevels} from "../collections/CollectionAPI";

export const styles = {
    dialog: {
        width: 650
    },
    root: {
        display: 'block',
        paddingBottom: 40
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    autocomplete: {
        width: '100%'
    },
    accessLevelControl: {
        marginTop: 10
    },
    emptySelection: {
        fontStyle: 'italic',
        margin: 10
    },
    divider: {
        marginTop: 15,
        marginBottom: 15
    },
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
        height: 48
    },
    nameCell: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    }
};

export const UserPermissionsDialog = ({collection, permissionCandidates, workspaceUsers, currentUser, setPermission,
    open = false, onClose, isWorkspaceMember, classes}) => {
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const handleChangeSelectedPermission = (selectedPermission: Permission) => {
        const permissionToUpdate = selectedPermissions.find(p => p.iri === selectedPermission.iri);
        permissionToUpdate.access = selectedPermission.access;
        setSelectedPermissions([...selectedPermissions]);
    };

    const handleAddSelectedPermission = (selectedPermission: Permission) => {
        selectedPermissions.push(selectedPermission);
        setSelectedPermissions([...selectedPermissions]);
    };

    const handleDeleteSelectedPermission = (selectedPermission: Permission) => {
        const reducedPermissions = selectedPermissions.filter(p => selectedPermission.iri !== p.iri);
        setSelectedPermissions(reducedPermissions);
    };

    const handleClose = () => {
        setSelectedPermissions([]);
        onClose();
    };

    const handleSubmit = () => {
        if (selectedPermissions.length > 0) {
            selectedPermissions.forEach(p => setPermission(collection.location, p.iri, p.access));
            handleClose();
        }
    };

    const getAccessLevelsForPrincipal: AccessLevel[] = (selectedPrincipal) => {
        if (workspaceUsers.some(wu => wu.iri === selectedPrincipal.iri)) {
            return accessLevels;
        }
        return ['Read'];
    };

    function renderAccessLevelDropdown(selectedPermission: Permission) {
        const accessLevelOptions = getAccessLevelsForPrincipal(selectedPermission);
        return (
            <FormControl>
                <Select
                    value={selectedPermission.access}
                    onChange={v => handleChangeSelectedPermission({
                        ...selectedPermission,
                        access: v.target.value
                    })}
                >
                    {accessLevelOptions.map(access => (
                        <MenuItem key={access} value={access}>
                            <span>{access}</span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    const renderAccessLevelControl = () => (
        <div className={classes.accessLevelControl}>
            <Typography component="p">
                Selected users and access levels:
            </Typography>
            {selectedPermissions.length === 0 ? (
                <Typography variant="body2" className={classes.emptySelection}>
                    No user selected.
                </Typography>
            ) : (
                <Table size="small" className={classes.table}>
                    <TableBody className={classes.tableBody}>
                        {
                            selectedPermissions.map(p => (
                                <TableRow key={p.iri} className={classes.tableRow}>
                                    <TableCell style={{width: 30}}>
                                        <Person />
                                    </TableCell>
                                    <TableCell
                                        className={classes.nameCell}
                                        data-testid="permission"
                                    >
                                        {p.name}
                                    </TableCell>
                                    <TableCell style={{width: 40}}>
                                        {isWorkspaceMember(p) && (<Chip label="Member" />)}
                                    </TableCell>
                                    <TableCell style={{width: 85}}>
                                        {renderAccessLevelDropdown(p)}
                                    </TableCell>
                                    <TableCell style={{textAlign: "right", width: 30}}>
                                        <IconButton
                                            onClick={() => handleDeleteSelectedPermission(p)}
                                        >
                                            <Close />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            )}
        </div>
    );

    const renderUserSelector = () => (
        <PermissionCandidateSelect
            clearTextOnSelection
            loadOptionsOnMount={false}
            permissionCandidates={permissionCandidates}
            onChange={p => handleAddSelectedPermission({...p, access: "Read"})}
            filter={p => ((!currentUser || p.iri !== currentUser.iri) && !selectedPermissions.some(sp => sp.iri === p.iri))}
            label="Select user"
            autoFocus
        />
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            data-testid="user-permissions-dialog"
            className={classes.root}
            fullWidth
        >
            <DialogTitle id="scroll-dialog-title">Add access for selected users</DialogTitle>
            <DialogContent>
                <div>
                    {renderUserSelector()}
                    <Divider className={classes.divider} />
                    {renderAccessLevelControl()}
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    disabled={Boolean(selectedPermissions.length === 0)}
                    data-testid="submit"
                >
                    Save
                </Button>
                <Button
                    onClick={handleClose}
                    color="default"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

UserPermissionsDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    setPermission: PropTypes.func.isRequired,
    isWorkspaceMember: PropTypes.func.isRequired,
    collection: PropTypes.object,
    permissionCandidates: PropTypes.array,
    workspaceUsers: PropTypes.array,
    currentUser: PropTypes.object
};

export default withStyles(styles)(UserPermissionsDialog);
