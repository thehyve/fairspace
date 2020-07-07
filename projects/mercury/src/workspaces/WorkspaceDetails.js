// @flow
import React, {useContext, useState} from 'react';
import {withRouter} from 'react-router-dom';
import {Card, CardContent, CardHeader, Grid, IconButton, Menu, MenuItem, withStyles} from "@material-ui/core";
import {MoreVert, Widgets} from "@material-ui/icons";
import PermissionContext, {PermissionProvider} from "../permissions/PermissionContext";
import PermissionsCard from "../permissions/PermissionsCard";
import type {Workspace} from "./WorkspacesAPI";
import LoadingInlay from "../common/components/LoadingInlay";
import UserContext from "../users/UserContext";
import {isAdmin} from "../users/userUtils";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import ErrorDialog from "../common/components/ErrorDialog";
import UsersContext from "../users/UsersContext";
import {formatDateTime} from "../common/utils/genericUtils";


const styles = {
    statusLabel: {
        color: 'gray'
    },
    statusText: {
        fontSize: 'small',
        marginTop: 2,
        marginBottom: 0,
        marginInlineStart: 4
    },
    statusDetails: {
        marginLeft: 8
    },
    statusCard: {
        paddingTop: 0
    }
};

type WorkspaceDetailsProps = {
    loading: boolean;
    workspace: Workspace;
    classes: Object;
    updateWorkspaceStatus: (Workspace) => Promise<void>,
};

const WorkspaceDetails = (props: WorkspaceDetailsProps) => {
    const {loading, workspace, updateWorkspaceStatus, classes} = props;
    const {currentUser} = useContext(UserContext);
    const {users} = useContext(UsersContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showStatusUpdateConfirmDialog, setShowStatusUpdateConfirmDialog] = useState(false);
    const [newStatus, setNewStatus] = useState(null);

    if (loading) {
        return <LoadingInlay />;
    }

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleUpdateStatus = (status) => {
        setNewStatus(status);
        setShowStatusUpdateConfirmDialog(true);
    };

    const handleCloseUpdateStatus = () => {
        setShowStatusUpdateConfirmDialog(false);
    };

    const updateStatus = () => {
        workspace.status = newStatus;
        updateWorkspaceStatus(workspace)
            .catch(err => {
                const message = err && err.message ? err.message : "An error occurred while updating a workspace status";
                ErrorDialog.showError(err, message);
            })
            .finally(() => handleCloseUpdateStatus());
    };

    const getUserName = iri => {
        const user = users.find(u => u.iri === iri);
        return user ? user.name : '-';
    };

    const renderStatusUpdateConfirmation = () => (
        <ConfirmationDialog
            open
            title="Confirmation"
            content={`Are you sure you want to change a status of ${workspace.name} to ${newStatus}`}
            dangerous
            agreeButtonText="Yes"
            onAgree={updateStatus}
            onDisagree={handleCloseUpdateStatus}
            onClose={handleCloseUpdateStatus}
        />
    );

    const renderWorkspaceStatus = () => (
        <Grid container direction="row">
            <Grid item xs={11}>
                <Grid container>
                    <Grid item xs={12}>
                        <legend className={classes.statusLabel}>Status</legend>
                        <div className={classes.statusDetails}>
                            <p className={classes.statusText}>
                                {workspace.status}
                            </p>
                            <p className={`${classes.statusLabel} ${classes.statusText}`}>
                                Modified by: {getUserName(workspace.statusModifiedBy)}
                            </p>
                            <p className={`${classes.statusLabel} ${classes.statusText}`}>
                                Modification date: {formatDateTime(workspace.statusDateModified) || '-'}
                            </p>
                        </div>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );

    const statusUpdateMenuAction = (
        <>
            <IconButton
                aria-label="More"
                aria-owns={anchorEl ? 'long-menu' : undefined}
                aria-haspopup="true"
                onClick={handleMenuClick}
            >
                <MoreVert />
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {workspace.status === 'Active' ? (
                    <MenuItem onClick={() => handleUpdateStatus('Archived')}>
                        Archive workspace
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => handleUpdateStatus('Active')}>
                        Activate workspace
                    </MenuItem>
                )}
            </Menu>
        </>
    );

    const renderWorkspaceSettingsCard = () => (
        <Card>
            <CardHeader
                action={isAdmin(currentUser) ? statusUpdateMenuAction : null}
                titleTypographyProps={{variant: 'h6'}}
                title={workspace.id}
                avatar={(
                    <Widgets />
                )}
            />
            <CardContent className={classes.statusCard}>
                {renderWorkspaceStatus()}
            </CardContent>
        </Card>
    );

    return (
        <>
            {showStatusUpdateConfirmDialog ? renderStatusUpdateConfirmation() : null}
            {renderWorkspaceSettingsCard()}
        </>
    );
};

export default withRouter(withStyles(styles)(WorkspaceDetails));
