// @flow
import React, {useContext, useState} from 'react';
import {IconButton, Table, TableBody, TableCell, TableRow, Typography, withStyles} from '@material-ui/core';
import {Add, Close, Widgets} from "@material-ui/icons";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import WorkspaceContext from "../workspaces/WorkspaceContext";
import ErrorDialog from "../common/components/ErrorDialog";
import {sortPermissions} from "../collections/collectionUtils";
import AlterWorkspacePermissionsDialog from "./AlterWorkspacePermissionsDialog";

const styles = {
    tableWrapper: {
        border: "1px solid #e0e0e0",
        borderRadius: 6,
        marginLeft: 16,
        marginRight: 16,
        marginTop: 16
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
    },
    iconCellButton: {
        paddingTop: 0,
        paddingBottom: 0
    },
    emptyPermissions: {
        margin: 10
    }
};

export const WorkspacePermissionsList = ({permissions, setPermission, collection, workspaces, classes}) => {
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(false);
    const [showWorkspacePermissionsDialog, setShowWorkspacePermissionsDialog] = useState(false);

    const sortedPermissions = sortPermissions(permissions.filter(p => p.iri !== collection.ownerWorkspace));
    const permissionCandidates = workspaces.filter(
        w => !sortedPermissions.some(p => p.iri === w.iri)
    );

    const handleDeletePermission = (workspace) => {
        setShowConfirmDeleteDialog(true);
        setSelectedWorkspace(workspace);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setShowConfirmDeleteDialog(false);
    };

    const removePermission = (principal) => {
        setPermission(collection.location, principal.iri, 'None')
            .catch(e => ErrorDialog.showError(e, 'Error removing permission.'))
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
                Workspaces:
            </Typography>
            <Tooltip title="Add workspace">
                {collection.canManage && (
                    <IconButton
                        color="primary"
                        aria-label="add workspace"
                        className={classes.addButton}
                        onClick={() => handleAlterWorkspacePermissionsDialogShow()}
                    >
                        <Add />
                    </IconButton>
                )}
            </Tooltip>
        </Toolbar>
    );

    const renderPermissionTable = () => (
        <Table size="small" className={classes.table}>
            <TableBody className={classes.tableBody}>
                {
                    sortedPermissions.map(p => (
                        <TableRow key={p.iri} className={classes.tableRow}>
                            <TableCell style={{width: 30}}>
                                <Widgets />
                            </TableCell>
                            <TableCell className={classes.nameCell}>
                                {p.name}
                            </TableCell>
                            <TableCell style={{textAlign: "right", width: 30}} className={classes.iconCellButton}>
                                {collection.canManage && (
                                    <IconButton
                                        onClick={() => handleDeletePermission(p)}
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

    const renderDeletionConfirmationDialog = () => {
        if (!selectedWorkspace || !showConfirmDeleteDialog) {
            return null;
        }

        const content = `Are you sure you do not want to share collection "${collection.name}" with workspace "${selectedWorkspace.name}" anymore?`;

        return (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={content}
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
            {sortedPermissions && sortedPermissions.length > 0 ? renderPermissionTable() : (
                <Typography variant="body2" className={classes.emptyPermissions}>
                    Collection is not shared with other workspaces.
                </Typography>
            )}
            {renderAlterWorkspacePermissionsDialog()}
            {renderDeletionConfirmationDialog()}
        </div>
    );
};

const ContextualWorkspacePermissionsList = (props) => {
    const {workspaces, workspaceLoading, workspaceError} = useContext(WorkspaceContext);

    return (
        <WorkspacePermissionsList
            {...props}
            loading={workspaceLoading}
            error={workspaceError}
            workspaces={workspaces}
        />
    );
};

export default withStyles(styles)(ContextualWorkspacePermissionsList);
