import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import withStyles from '@mui/styles/withStyles';
import {Typography} from '@mui/material';
import Divider from '@mui/material/Divider';
import PermissionCandidateSelect from './PermissionCandidateSelect';
import type {Permission} from '../collections/CollectionAPI';
import WorkspacePermissionsTable from './WorkspacePermissionsTable';

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
    divider: {
        marginTop: 15,
        marginBottom: 15
    }
};

export const AlterWorkspacePermissionsDialog = ({collection, permissionCandidates, setPermission,
    open = false, onClose, classes}) => {
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const handleDeleteSelectedPermission = (selectedPermission: Permission) => {
        const reducedPermissions = selectedPermissions.filter(p => selectedPermission.iri !== p.iri);
        setSelectedPermissions(reducedPermissions);
    };

    const handleAddSelectedPermission = (selectedPermission: Permission) => {
        selectedPermissions.push(selectedPermission);
        setSelectedPermissions([...selectedPermissions]);
    };

    const handleClose = () => {
        setSelectedPermissions([]);
        onClose();
    };

    const handleSubmit = () => {
        if (selectedPermissions.length > 0) {
            selectedPermissions.forEach(p => setPermission(collection.name, p.iri, p.access));
            handleClose();
        }
    };

    const renderSelectedWorkspaceList = () => (
        <div className={classes.accessLevelControl}>
            <Typography component="p">
                Selected workspaces
            </Typography>
            <WorkspacePermissionsTable
                emptyPermissionsText="No workspace selected."
                selectedPermissions={selectedPermissions}
                handleDeleteSelectedPermission={handleDeleteSelectedPermission}
                canManage={collection.canManage}
            />
        </div>
    );

    const renderWorkspaceSelector = () => (
        <PermissionCandidateSelect
            disableClearable
            loadOptionsOnMount={false}
            permissionCandidates={permissionCandidates}
            onChange={p => handleAddSelectedPermission({...p, access: 'Read'})}
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
                <Button onClick={handleClose}>
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
