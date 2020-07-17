// @flow
import React, {useContext, useState} from 'react';
import {useHistory, withRouter} from 'react-router-dom';
import {Card, CardContent, CardHeader, Grid, IconButton, Menu, MenuItem, withStyles} from "@material-ui/core";
import {MoreVert, Widgets} from "@material-ui/icons";
import type {Workspace} from "./WorkspacesAPI";
import LoadingInlay from "../common/components/LoadingInlay";
import UserContext from "../users/UserContext";
import {isAdmin} from "../users/userUtils";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import ErrorDialog from "../common/components/ErrorDialog";
import UsersContext from "../users/UsersContext";
import {formatDateTime} from "../common/utils/genericUtils";
import CollectionsContext from "../collections/CollectionsContext";
import type {Collection} from "../collections/CollectionAPI";
import type {User} from "../users/UsersAPI";


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
    updateWorkspaceStatus: (Workspace) => Promise<void>;
    deleteWorkspace: (Workspace) => Promise<void>;
    history: History;
    currentUser: User;
    users: User[];
    collections: Collection[];
};

const WorkspaceDetails = (props: WorkspaceDetailsProps) => {
    const {loading, workspace, updateWorkspaceStatus, deleteWorkspace, classes, history, currentUser, users, collections} = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const [showDeletionConfirmDialog, setShowDeletionConfirmDialog] = useState(false);
    const [showStatusUpdateConfirmDialog, setShowStatusUpdateConfirmDialog] = useState(false);
    const [newStatus, setNewStatus] = useState(null);

    if (loading) {
        return <LoadingInlay />;
    }

    const isNonEmptyWorkspace = collections.some(c => c.ownerWorkspace === workspace.iri);

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

    const handleDeleteWorkspace = () => {
        setShowDeletionConfirmDialog(true);
    };

    const handleCloseUpdateStatus = () => {
        setShowStatusUpdateConfirmDialog(false);
    };

    const handleCloseDeleteWorkspace = () => {
        setShowDeletionConfirmDialog(false);
    };

    const deleteCurrentWorkspace = () => {
        handleCloseDeleteWorkspace();
        deleteWorkspace(workspace)
            .then(() => history.push('/workspaces'))
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a workspace",
                () => handleDeleteWorkspace()
            ));
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

    const renderDeletionConfirmation = () => (
        <ConfirmationDialog
            open
            title="Confirmation"
            content={`Are you sure you want to delete workspace ${workspace.name}? This operation cannot be reverted.`}
            dangerous
            agreeButtonText="Yes"
            onAgree={deleteCurrentWorkspace}
            onDisagree={handleCloseDeleteWorkspace}
            onClose={handleCloseDeleteWorkspace}
        />
    );

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
                <MenuItem
                    disabled={isNonEmptyWorkspace}
                    title="Delete empty workspace."
                    onClick={handleDeleteWorkspace}
                >
                    Delete workspace
                </MenuItem>
            </Menu>
        </>
    );

    const renderWorkspaceSettingsCard = () => (
        <Card>
            <CardHeader
                action={isAdmin(currentUser) ? statusUpdateMenuAction : null}
                titleTypographyProps={{variant: 'h6'}}
                title={workspace.name}
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
            {showStatusUpdateConfirmDialog && renderStatusUpdateConfirmation()}
            {showDeletionConfirmDialog && renderDeletionConfirmation()}
            {renderWorkspaceSettingsCard()}
        </>
    );
};

const ContextualWorkspaceDetails = (props) => {
    const history = useHistory();

    const {currentUser} = useContext(UserContext);
    const {users} = useContext(UsersContext);
    const {collections, loading: collectionsLoading} = useContext(CollectionsContext);

    return (
        <WorkspaceDetails
            {...props}
            history={history}
            currentUser={currentUser}
            users={users}
            collections={collections}
            loading={props.loading || collectionsLoading}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualWorkspaceDetails));
