import React, {useContext, useState} from 'react';
import {Button, List} from "@material-ui/core";
import {Person, Widgets} from "@material-ui/icons";
import AlterPermissionDialog from "./AlterPermissionDialog";
import {mapPrincipalPermission, sortPermissions} from './permissionUtils';
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import PermissionsList from "./PermissionsList";
import UserContext from "../users/UserContext";
import CollectionsContext from "../collections/CollectionsContext";

export const PermissionViewer = ({collection, users, workspaces, workspaceUsers, collaborators, currentUser, setPermission, error, loading}) => {
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [selectedPrincipal, setSelectedPrincipal] = useState(null);

    if (error) {
        return (<MessageDisplay message="An error occurred loading permissions" />);
    }
    if (loading) {
        return (<LoadingInlay />);
    }

    const sortedCollaborators = sortPermissions(collaborators);
    const collaborationCandidates = [
        ...workspaces.map(w => mapPrincipalPermission(w, 'Workspace')),
        ...users.map(w => mapPrincipalPermission(w, 'User'))]
        .filter(p => !sortedCollaborators.some(c => c.iri === p.iri));

    const getItemIcon = (principal) => ((principal.type === 'Workspace') ? <Widgets /> : <Person />);

    const handleAlterPermission = (principal) => {
        setShowPermissionDialog(true);
        setSelectedPrincipal(principal);
    };

    const handleAlterPermissionDialogClose = () => {
        setShowPermissionDialog(false);
        setSelectedPrincipal(null);
    };

    const renderPermissionList = () => (
        <PermissionsList
            permissions={sortedCollaborators}
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
            {renderPermissionList()}
            {collection.canManage && (
                <div>
                    <Button
                        variant="text"
                        title="Share"
                        aria-label="Share"
                        color="primary"
                        onClick={() => handleAlterPermission(null)}
                    >
                        Share
                    </Button>
                </div>
            )}
        </List>
    );

    const renderPermissionDialog = () => (
        <AlterPermissionDialog
            open={showPermissionDialog}
            onClose={handleAlterPermissionDialogClose}
            title="Alter permission"
            principal={selectedPrincipal}
            access={selectedPrincipal && selectedPrincipal.access}
            collection={collection}
            currentUser={currentUser}
            permissions={sortedCollaborators}
            permissionCandidates={collaborationCandidates}
            workspaceUsers={workspaceUsers}
        />
    );

    return (
        <>
            {renderPermissionDialog()}
            {renderCollaboratorsList()}
        </>
    );
};

PermissionViewer.defaultProps = {};

const ContextualPermissionViewer = ({collection, users, workspaces, workspaceUsers, collaborators}) => {
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {setPermission, loading, error} = useContext(CollectionsContext);

    return (
        <PermissionViewer
            loading={currentUserLoading || loading}
            error={currentUserError || error}
            setPermission={setPermission}
            currentUser={currentUser}
            collaborators={collaborators}
            collection={collection}
            users={users}
            workspaces={workspaces}
            workspaceUsers={workspaceUsers}
        />
    );
};

export default ContextualPermissionViewer;
