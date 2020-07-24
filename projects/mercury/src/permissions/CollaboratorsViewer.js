import React, {useContext, useState} from 'react';
import {Button, List} from "@material-ui/core";
import {Person, Widgets} from "@material-ui/icons";
import AlterPermissionDialog from "./AlterPermissionDialog";
import {sortPermissions} from './permissionUtils';
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import PermissionsList from "./PermissionsList";
import UserContext from "../users/UserContext";
import CollectionsContext from "../collections/CollectionsContext";

export const CollaboratorsViewer = ({collection, collaborators, collaboratorCandidates, ownerWorkspace, currentUser,
    setPermission, error, loading}) => {
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [selectedPrincipal, setSelectedPrincipal] = useState(null);

    if (error) {
        return (<MessageDisplay message="An error occurred loading permissions" />);
    }
    if (loading) {
        return (<LoadingInlay />);
    }

    let sortedCollaboratorsList = sortPermissions(collaborators);

    const hasOwnerWorkspaceAccess: boolean = ownerWorkspace && ownerWorkspace.access && ownerWorkspace.access !== 'None';
    if (hasOwnerWorkspaceAccess) {
        sortedCollaboratorsList = [ownerWorkspace, ...sortedCollaboratorsList];
    }

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

    const renderPermissionList = () => (
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

    const renderCollaboratorsList = () => (
        <List dense disablePadding>
            {renderPermissionList(collaborators)}
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
                        disabled={hasOwnerWorkspaceAccess}
                    >
                        Add access to all members
                    </Button>
                </div>
            )}
        </List>
    );

    const renderPermissionDialog = () => (
        <AlterPermissionDialog
            open={showPermissionDialog}
            onClose={handleAlterPermissionDialogClose}
            title="Select access right for a collaborator"
            principal={selectedPrincipal}
            access={selectedPrincipal && selectedPrincipal.access}
            collection={collection}
            currentUser={currentUser}
            permissions={collaborators}
            permissionCandidates={collaboratorCandidates}
        />
    );

    return (
        <>
            {renderPermissionDialog()}
            {renderCollaboratorsList()}
        </>
    );
};

CollaboratorsViewer.defaultProps = {
    renderPermissionsDialog: () => {
    }
};

const ContextualCollaboratorsViewer = ({collection, collaborators, ownerWorkspace, collaboratorCandidates}) => {
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {setPermission, loading, error} = useContext(CollectionsContext);

    return (
        <CollaboratorsViewer
            loading={currentUserLoading || loading}
            error={currentUserError || error}
            setPermission={setPermission}
            currentUser={currentUser}
            collaboratorCandidates={collaboratorCandidates}
            collaborators={collaborators}
            ownerWorkspace={ownerWorkspace}
            collection={collection}
        />
    );
};


export default ContextualCollaboratorsViewer;
