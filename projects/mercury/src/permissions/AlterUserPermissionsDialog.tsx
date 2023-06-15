// @ts-nocheck
// @ts-nocheck
import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import withStyles from "@mui/styles/withStyles";
import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import PermissionCandidateSelect from "./PermissionCandidateSelect";
import type { Permission } from "../collections/CollectionAPI";
import UserPermissionsTable from "./UserPermissionsTable";
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
    flexWrap: 'wrap'
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
export const AlterUserPermissionsDialog = ({
  collection,
  permissionCandidates,
  workspaceUsers,
  currentUser,
  setPermission,
  open = false,
  onClose,
  classes
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const handleClose = () => {
    setSelectedPermissions([]);
    onClose();
  };

  const handleAddSelectedPermission = (selectedPermission: Permission) => {
    selectedPermissions.push(selectedPermission);
    setSelectedPermissions([...selectedPermissions]);
  };

  const handleDeleteSelectedPermission = (selectedPermission: Permission) => {
    const reducedPermissions = selectedPermissions.filter(p => selectedPermission.iri !== p.iri);
    setSelectedPermissions(reducedPermissions);
  };

  const handleChangeSelectedPermission = (selectedPermission: Permission) => {
    const permissionToUpdate = selectedPermissions.find(p => p.iri === selectedPermission.iri);
    permissionToUpdate.access = selectedPermission.access;
    setSelectedPermissions([...selectedPermissions]);
  };

  const handleSubmit = () => {
    if (selectedPermissions.length > 0) {
      selectedPermissions.forEach(p => setPermission(collection.name, p.iri, p.access));
      handleClose();
    }
  };

  const renderAccessLevelControl = () => <div className={classes.accessLevelControl}>
            <Typography component="p">
                Selected users and access levels
            </Typography>
            <UserPermissionsTable selectedPermissions={selectedPermissions} workspaceUsers={workspaceUsers} emptyPermissionsText="No user selected" setSelectedPermissions={setSelectedPermissions} canManage={collection.canManage} currentUser={currentUser} handleDeletePermission={handleDeleteSelectedPermission} handleChangePermission={handleChangeSelectedPermission} />
        </div>;

  const renderUserSelector = () => <PermissionCandidateSelect disableClearable loadOptionsOnMount={false} permissionCandidates={permissionCandidates} onChange={p => handleAddSelectedPermission({ ...p,
    access: "Read"
  })} filter={p => (!currentUser || p.iri !== currentUser.iri) && !selectedPermissions.some(sp => sp.iri === p.iri)} label="Select user" autoFocus />;

  return <Dialog open={open} onClose={handleClose} data-testid="user-permissions-dialog" className={classes.root} fullWidth>
            <DialogTitle id="scroll-dialog-title">Share collections with users</DialogTitle>
            <DialogContent>
                <div>
                    {renderUserSelector()}
                    <Divider className={classes.divider} />
                    {renderAccessLevelControl()}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSubmit} color="primary" disabled={Boolean(selectedPermissions.length === 0)} data-testid="submit">
                    Save
                </Button>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>;
};
AlterUserPermissionsDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  setPermission: PropTypes.func.isRequired,
  collection: PropTypes.object,
  permissionCandidates: PropTypes.array,
  workspaceUsers: PropTypes.array,
  currentUser: PropTypes.object
};
export default withStyles(styles)(AlterUserPermissionsDialog);