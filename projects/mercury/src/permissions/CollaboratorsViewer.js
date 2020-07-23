import React, {useState} from 'react';
import {Button, List} from "@material-ui/core";
import {Person, Widgets} from "@material-ui/icons";
import AlterPermissionContainer from "./AlterPermissionContainer";
import {sortPermissions} from './permissionUtils';
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import PermissionsList from "./PermissionsList";

const CollaboratorsViewer = ({collection, usersWithCollectionAccess, workspaceWithCollectionAccess,
    workspaceUsers, workspaces = [], currentUser, setPermission, error, loading}) => {
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [selectedPrincipal, setSelectedPrincipal] = useState(null);

    if (error) {
        return (<MessageDisplay message="An error occurred loading permissions" />);
    }
    if (loading) {
        return (<LoadingInlay />);
    }
    if (!usersWithCollectionAccess) {
        return (<div>No permission found</div>);
    }

    let sortedCollaboratorsList = sortPermissions(usersWithCollectionAccess);
    if (workspaceWithCollectionAccess) {
        sortedCollaboratorsList = [workspaceWithCollectionAccess, ...sortedCollaboratorsList];
    }
    const ownerWorkspace = workspaces.find(w => w.iri === collection.ownerWorkspace);

    const getItemIcon = (principal) => ((principal.iri === ownerWorkspace.iri) ? <Widgets /> : <Person />);

    const handleAlterPermission = (user) => {
        setShowPermissionDialog(true);
        setSelectedPrincipal(user);
    };

    const handleAlterOwnerWorkspacePermission = () => {
        setShowPermissionDialog(true);
        setSelectedPrincipal(ownerWorkspace);
    };

    const handleAlterPermissionDialogClose = () => {
        setShowPermissionDialog(false);
        setSelectedPrincipal(null);
    };

    const renderCollaboratorList = () => (
        <PermissionsList
            permissions={sortedCollaboratorsList}
            collection={collection}
            setPermission={setPermission}
            currentUser={currentUser}
            selectedPrincipal={selectedPrincipal}
            setSelectedPrincipal={setSelectedPrincipal}
            setShowPermissionDialog={setShowPermissionDialog}
            getItemIcon={getItemIcon}
        />
    );

    const renderUserList = () => (
        <List dense disablePadding>
            {renderCollaboratorList(usersWithCollectionAccess)}
            {collection.canManage && (
                <div>
                    <Button
                        variant="text"
                        title="Add single collaborator"
                        aria-label="Add collaborator"
                        color="primary"
                        onClick={() => handleAlterPermission(null)}
                    >
                        Add collaborator
                    </Button>
                    <Button
                        variant="text"
                        title="Add all owner workspace members"
                        aria-label="Add all members"
                        color="primary"
                        onClick={handleAlterOwnerWorkspacePermission}
                        disabled={workspaceWithCollectionAccess}
                    >
                        Add access to all members
                    </Button>
                </div>
            )}
        </List>
    );

    const renderPermissionDialog = () => (
        <AlterPermissionContainer
            open={showPermissionDialog}
            onClose={handleAlterPermissionDialogClose}
            title="Select access right for a collaborator"
            user={selectedPrincipal}
            access={selectedPrincipal && selectedPrincipal.access}
            collection={collection}
            currentUser={currentUser}
            usersWithCollectionAccess={usersWithCollectionAccess}
            users={workspaceUsers}
        />
    );

    return (
        <>
            {renderPermissionDialog()}
            {renderUserList()}
        </>
    );
};

CollaboratorsViewer.defaultProps = {
    renderPermissionsDialog: () => {
    }
};

export default CollaboratorsViewer;
