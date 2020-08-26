// @flow
import React, {useContext, useState} from 'react';
import {IconButton, Menu, Table, TableBody, TableCell, TableRow, Typography, withStyles} from '@material-ui/core';
import MoreIcon from "@material-ui/icons/MoreVert";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import {Add, Person} from "@material-ui/icons";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Chip from "@material-ui/core/Chip";
import ErrorDialog from "../common/components/ErrorDialog";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import AlterPermissionDialog from "./AlterPermissionDialog";
import UsersContext from "../users/UsersContext";
import {canAlterPermission, sortPermissions} from "../collections/collectionUtils";

const styles = {
    tableWrapper: {
        border: "1px solid #e0e0e0",
        borderRadius: 6,
        marginLeft: 16,
        marginRight: 16
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
    highlightedCell: {
        fontWeight: "bold"
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

export const UserPermissionsList = ({permissions, setPermission, collection, currentUser, workspaceUsers, users, classes}) => {
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [selectedPrincipal, setSelectedPrincipal] = useState(null);

    const isWorkspaceMember = (principal) => principal && workspaceUsers.some(u => u.iri === principal.iri);
    const sortedPermissions = sortPermissions(permissions);
    const prioritizedSortedPermissions = [
        ...sortedPermissions.filter(p => isWorkspaceMember(p)),
        ...sortedPermissions.filter(p => !isWorkspaceMember(p))
    ];
    const permissionCandidates = users.filter(p => !sortedPermissions.some(c => c.iri === p.iri));

    const handleAlterPermissionDialogClose = () => {
        setShowPermissionDialog(false);
        setSelectedPrincipal(null);
    };

    const handleDeletePermission = (principal) => {
        setShowConfirmDeleteDialog(true);
        setSelectedPrincipal(principal);
        setAnchorEl(null);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setShowConfirmDeleteDialog(false);
    };

    const removePermission = (principal) => {
        setPermission(collection.location, principal.iri, 'None')
            .catch(e => ErrorDialog.showError(e, 'Error removing permission.'))
            .finally(handleCloseConfirmDeleteDialog);
    };

    const handleAlterPermission = (principal) => {
        setShowPermissionDialog(true);
        setSelectedPrincipal(principal);
        setAnchorEl(null);
    };

    const handleMenuClick = (event, principal) => {
        setAnchorEl(event.currentTarget);
        setSelectedPrincipal(principal);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedPrincipal(null);
    };

    const selectedPrincipalKey = selectedPrincipal ? selectedPrincipal.access + selectedPrincipal.iri : null;

    const renderHeader = () => (
        <Toolbar className={classes.header}>
            <Typography variant="body1" id="tableTitle" component="div">
                Users:
            </Typography>
            <Tooltip title="Add users">
                {collection.canManage && (
                    <IconButton
                        color="primary"
                        aria-label="add user permission"
                        className={classes.addButton}
                        onClick={() => handleAlterPermission(null)}
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
                    prioritizedSortedPermissions.map(p => {
                        const key = p.access + p.iri;
                        return (
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
                                <TableCell style={{width: 60}}>
                                    {isWorkspaceMember(p) && (<Chip label="Member" />)}
                                </TableCell>
                                <TableCell style={{width: 60, fontStyle: "italic"}}>
                                    {p.access}
                                </TableCell>
                                <TableCell style={{textAlign: "right", width: 30}} className={classes.iconCellButton}>
                                    {collection.canManage && (
                                        <IconButton
                                            onClick={e => handleMenuClick(e, p)}
                                            disabled={currentUser && !canAlterPermission(collection.canManage, p, currentUser)}
                                        >
                                            <MoreIcon />
                                        </IconButton>
                                    )}
                                    <Menu
                                        id="more-menu"
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl) && key === selectedPrincipalKey}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem
                                            disabled={!isWorkspaceMember(p)}
                                            onClick={() => handleAlterPermission(p)}
                                        >
                                            Change access
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => handleDeletePermission(p)}
                                        >
                                            Delete
                                        </MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                }
            </TableBody>
        </Table>
    );

    const renderDeletionConfirmationDialog = () => {
        if (!selectedPrincipal || !showConfirmDeleteDialog) {
            return null;
        }

        const content = `Are you sure you want to remove permission for "${selectedPrincipal.name}"?`;

        return (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={content}
                dangerous
                agreeButtonText="Remove"
                onAgree={() => removePermission(selectedPrincipal)}
                onDisagree={handleCloseConfirmDeleteDialog}
                onClose={handleCloseConfirmDeleteDialog}
            />
        );
    };

    const renderPermissionDialog = () => (
        <AlterPermissionDialog
            open={showPermissionDialog}
            onClose={handleAlterPermissionDialogClose}
            title="Alter permission"
            principal={selectedPrincipal}
            access={selectedPrincipal && selectedPrincipal.access}
            collection={collection}
            currentUser={currentUser}
            permissionCandidates={permissionCandidates}
            workspaceUsers={workspaceUsers}
        />
    );

    return (
        <div className={classes.tableWrapper}>
            {renderHeader()}
            {permissions && permissions.length > 0 ? renderPermissionTable() : (
                <Typography variant="body2" className={classes.emptyPermissions}>
                    Collection is not shared with any user.
                </Typography>
            )}
            {renderPermissionDialog()}
            {renderDeletionConfirmationDialog()}
        </div>
    );
};

const ContextualUserPermissionsList = (props) => {
    const {users, usersLoading, usersError} = useContext(UsersContext);

    return (
        <UserPermissionsList
            {...props}
            loading={usersLoading}
            error={usersError}
            users={users}
        />
    );
};

export default withStyles(styles)(ContextualUserPermissionsList);
