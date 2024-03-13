import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {Box, FormHelperText, FormLabel} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import MessageDisplay from '../common/components/MessageDisplay';
import LoadingInlay from '../common/components/LoadingInlay';
import UserPermissionsComponent from './UserPermissionsComponent';
import UserContext from '../users/UserContext';
import CollectionsContext from '../collections/CollectionsContext';
import WorkspacePermissionsComponent from './WorkspacePermissionsComponent';
import {sortPermissions} from '../collections/collectionUtils';

const useStyles = makeStyles({
    root: {
        marginLeft: 20,
        marginBottom: 5
    },
});

export const PermissionViewer = ({
    collection, workspaceUsers, collaboratingWorkspaces,
    collaboratingUsers, currentUser, setPermission, error, loading
}) => {
    const classes = useStyles();

    if (error) {
        return (<MessageDisplay message="An error occurred loading permissions" />);
    }
    if (loading) {
        return (<LoadingInlay />);
    }

    const renderUserPermissionComponent = () => (
        <UserPermissionsComponent
            permissions={sortPermissions(collaboratingUsers)}
            collection={collection}
            setPermission={setPermission}
            currentUser={currentUser}
            workspaceUsers={workspaceUsers}
        />
    );

    const renderWorkspacePermissionComponent = () => (
        <WorkspacePermissionsComponent
            permissions={sortPermissions(collaboratingWorkspaces)}
            setPermission={setPermission}
            collection={collection}
        />
    );

    return (
        <div>
            <FormLabel>Share with users</FormLabel>
            <Box className={classes.root}>
                {renderUserPermissionComponent()}
                <FormHelperText>Members of the owner workspace can have modify rights, all others have read-only rights.</FormHelperText>
            </Box>
            <FormLabel>Share with workspaces</FormLabel>
            <Box className={classes.root}>
                {renderWorkspacePermissionComponent()}
            </Box>
        </div>
    );
};

PermissionViewer.defaultProps = {
    collection: PropTypes.object.isRequired,
    workspaceUsers: PropTypes.array.isRequired,
    collaboratingWorkspaces: PropTypes.array,
    collaboratingUsers: PropTypes.array,
    currentUser: PropTypes.object,
    setPermission: PropTypes.func
};

const ContextualPermissionViewer = ({collection, workspaceUsers, collaboratingUsers, collaboratingWorkspaces}) => {
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {setPermission, loading, error} = useContext(CollectionsContext);

    return (
        <PermissionViewer
            loading={currentUserLoading || loading}
            error={currentUserError || error}
            setPermission={setPermission}
            currentUser={currentUser}
            collaboratingUsers={collaboratingUsers}
            collaboratingWorkspaces={collaboratingWorkspaces}
            collection={collection}
            workspaceUsers={workspaceUsers}
        />
    );
};

export default ContextualPermissionViewer;
