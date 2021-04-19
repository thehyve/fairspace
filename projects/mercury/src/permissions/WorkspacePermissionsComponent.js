// @flow
import React, {useContext, useState} from 'react';
import {IconButton, Typography, withStyles} from '@material-ui/core';
import {Add} from "@material-ui/icons";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import PropTypes from "prop-types";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import WorkspaceContext from "../workspaces/WorkspaceContext";
import ErrorDialog from "../common/components/ErrorDialog";
import {sortPermissions} from "../collections/collectionUtils";
import AlterWorkspacePermissionsDialog from "./AlterWorkspacePermissionsDialog";
import WorkspacePermissionsTable from "./WorkspacePermissionsTable";
import type {Permission} from "../collections/CollectionAPI";

const styles = {
    tableWrapper: {
        border: "1px solid #e0e0e0",
        borderRadius: 6,
        marginTop: 16,
        display: 'table',
        width: '99%'
    },
    header: {
        backgroundColor: "#f5f5f5",
        color: "black",
        fontWeight: "normal",
        display: "flex",
        paddingTop: 0,
        paddingBottom: 0,
        height: 48,
        minHeight: 48
    },
    addButton: {
        marginLeft: "auto"
    }
};

export const WorkspacePermissionsComponent = ({permissions, setPermission, collection, workspaces, classes}) => {
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState();
    const [showWorkspacePermissionsDialog, setShowWorkspacePermissionsDialog] = useState(false);

    const sortedPermissions = sortPermissions(permissions.filter(p => p.iri !== collection.ownerWorkspace));
    const permissionCandidates = workspaces.filter(
        w => !sortedPermissions.some(p => p.iri === w.iri)
    );

    const handleDeletePermission = (permission: Permission) => {
        setShowConfirmDeleteDialog(true);
        setSelectedWorkspace(permission);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setShowConfirmDeleteDialog(false);
    };

    const removePermission = (permission: Permission) => {
        setPermission(collection.name, permission.iri, 'None')
            .catch(err => ErrorDialog.showError('Error removing permission.', err))
            .finally(handleCloseConfirmDeleteDialog);
    };

    const handleAlterWorkspacePermissionsDialogShow = () => {
        setShowWorkspacePermissionsDialog(true);
    };

    const handleWorkspacePermissionsDialogClose = () => {
        setShowWorkspacePermissionsDialog(false);
    };

    const renderHeader = () => (
        <Toolbar className={classes.header}>
            <Typography variant="body1" id="tableTitle" component="div">
                members
            </Typography>
            {collection.canManage && (
                <Tooltip title="Add workspace">
                    <IconButton
                        color="primary"
                        aria-label="add workspace"
                        className={classes.addButton}
                        onClick={() => handleAlterWorkspacePermissionsDialogShow()}
                    >
                        <Add />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );

    const renderPermissionTable = () => (
        <WorkspacePermissionsTable
            emptyPermissionsText="Collection is not shared with other workspaces."
            selectedPermissions={sortedPermissions}
            handleDeleteSelectedPermission={handleDeletePermission}
            canManage={collection.canManage}
        />
    );

    const renderDeletionConfirmationDialog = () => {
        if (!selectedWorkspace || !showConfirmDeleteDialog) {
            return null;
        }
        return (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={`Are you sure you do not want to share collection "${collection.name}" with workspace "${selectedWorkspace.name}" anymore?`}
                dangerous
                agreeButtonText="Remove"
                onAgree={() => removePermission(selectedWorkspace)}
                onDisagree={handleCloseConfirmDeleteDialog}
                onClose={handleCloseConfirmDeleteDialog}
            />
        );
    };

    const renderAlterWorkspacePermissionsDialog = () => (
        <AlterWorkspacePermissionsDialog
            open={showWorkspacePermissionsDialog}
            onClose={handleWorkspacePermissionsDialogClose}
            collection={collection}
            permissionCandidates={permissionCandidates}
            setPermission={setPermission}
        />
    );

    return (
        <div className={classes.tableWrapper}>
            {renderHeader()}
            {renderPermissionTable()}
            {renderAlterWorkspacePermissionsDialog()}
            {renderDeletionConfirmationDialog()}
        </div>
    );
};

WorkspacePermissionsComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    permissions: PropTypes.array,
    setPermission: PropTypes.func,
    collection: PropTypes.object,
    workspaces: PropTypes.array
};

const ContextualWorkspacePermissionsComponent = (props) => {
    const {workspaces, workspaceLoading, workspaceError} = useContext(WorkspaceContext);

    return (
        <WorkspacePermissionsComponent
            {...props}
            loading={workspaceLoading}
            error={workspaceError}
            workspaces={workspaces}
        />
    );
};

export default withStyles(styles)(ContextualWorkspacePermissionsComponent);
