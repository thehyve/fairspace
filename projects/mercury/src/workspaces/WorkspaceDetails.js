// @flow
import React, {useContext, useState} from 'react';
import {useHistory, withRouter} from 'react-router-dom';
import {Card, CardHeader, IconButton, Menu, MenuItem} from "@material-ui/core";
import {MoreVert, Widgets} from "@material-ui/icons";
import type {Workspace} from "./WorkspacesAPI";
import LoadingInlay from "../common/components/LoadingInlay";
import UserContext from "../users/UserContext";
import {isAdmin} from "../users/userUtils";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import ErrorDialog from "../common/components/ErrorDialog";
import UsersContext from "../users/UsersContext";
import CollectionsContext from "../collections/CollectionsContext";
import type {Collection} from "../collections/CollectionAPI";
import type {User} from "../users/UsersAPI";

type WorkspaceDetailsProps = {
    loading: boolean;
    workspace: Workspace;
    deleteWorkspace: (Workspace) => Promise<void>;
    history: History;
    currentUser: User;
    collections: Collection[];
};

const WorkspaceDetails = (props: WorkspaceDetailsProps) => {
    const {loading, workspace, deleteWorkspace, history, currentUser, collections} = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const [showDeletionConfirmDialog, setShowDeletionConfirmDialog] = useState(false);

    if (loading) {
        return <LoadingInlay />;
    }

    const isWorkspaceEmpty = !collections.some(c => c.ownerWorkspace === workspace.iri);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDeleteWorkspace = () => {
        setShowDeletionConfirmDialog(true);
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

    const renderMenuAction = (
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
                <MenuItem
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
                action={isAdmin(currentUser) && isWorkspaceEmpty ? renderMenuAction : null}
                titleTypographyProps={{variant: 'h6'}}
                title={workspace.name}
                avatar={(
                    <Widgets />
                )}
            />
        </Card>
    );

    return (
        <>
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

export default withRouter(ContextualWorkspaceDetails);
