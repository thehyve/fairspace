import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {withStyles} from '@material-ui/core/styles';
import {IconButton, Table, TableBody, TableCell, TableRow, Typography} from "@material-ui/core";
import {Close, Widgets} from "@material-ui/icons";
import Divider from "@material-ui/core/Divider";
import PermissionCandidateSelect from "./PermissionCandidateSelect";
import type {Permission} from "../collections/CollectionAPI";

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

export const AlterWorkspacePermissionsDialog = ({collection, permissionCandidates, setPermission,
    open = false, onClose, classes}) => {
    const [selectedPermissions, setSelectedPermissions] = useState([]);

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

    const renderSelectedWorkspaceList = () => (
        <div className={classes.accessLevelControl}>
            <Typography component="p">
                Selected workspaces:
            </Typography>
            {selectedPermissions.length === 0 ? (
                <Typography variant="body2" className={classes.emptySelection}>
                    No workspace selected.
                </Typography>
            ) : (
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

    const renderWorkspaceSelector = () => (
        <PermissionCandidateSelect
            clearTextOnSelection
            disableClearable
            loadOptionsOnMount={false}
            permissionCandidates={permissionCandidates}
            onChange={p => handleAddSelectedPermission({...p, access: "Read"})}
            filter={p => ((p.iri !== collection.ownerWorkspace) && !selectedPermissions.some(sp => sp.iri === p.iri))}
            label="Select workspace"
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
            <DialogTitle id="scroll-dialog-title">Share collection with workspaces</DialogTitle>
            <DialogContent>
                <div>
                    {renderWorkspaceSelector()}
                    <Divider className={classes.divider} />
                    {renderSelectedWorkspaceList()}
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

AlterWorkspacePermissionsDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    setPermission: PropTypes.func.isRequired,
    collection: PropTypes.object,
    permissionCandidates: PropTypes.array
};

export default withStyles(styles)(AlterWorkspacePermissionsDialog);
