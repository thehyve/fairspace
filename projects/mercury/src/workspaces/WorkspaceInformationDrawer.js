import React, {useContext} from 'react';
import {withStyles} from '@material-ui/core';
import {withRouter} from 'react-router-dom';
import PropTypes from "prop-types";

import styles from '../common/components/InformationDrawer.styles';
import EmptyInformationDrawer from "../common/components/EmptyInformationDrawer";
import WorkspaceContext from "./WorkspaceContext";
import WorkspaceDetails from "./WorkspaceDetails";


export const WorkspaceInformationDrawer = ({workspace, loading, atLeastSingleWorkspaceExists}) => {
    if (!workspace) {
        return atLeastSingleWorkspaceExists
            && <EmptyInformationDrawer message="Select a workspace to display its metadata" />;
    }

    if (!workspace.canRead) {
        return atLeastSingleWorkspaceExists
            && (
                <EmptyInformationDrawer message="You don't have access to see the metadata of this workspace.
                                                Please contact the administrator to get the access."
                />
            );
    }

    return (
        <>
            <WorkspaceDetails
                workspace={workspace}
                loading={loading}
            />
        </>
    );
};

const ContextualWorkspaceInformationDrawer = ({selectedWorkspaceIri, ...props}) => {
    const {workspacesLoading, workspaces} = useContext(WorkspaceContext);
    const workspace = workspaces.find(c => c.iri === selectedWorkspaceIri);
    const atLeastSingleWorkspaceExists = workspaces.length > 0;
    return (
        <WorkspaceInformationDrawer
            {...props}
            loading={workspacesLoading}
            workspace={workspace}
            atLeastSingleWorkspaceExists={atLeastSingleWorkspaceExists}
        />
    );
};

WorkspaceInformationDrawer.propTypes = {
    atLeastSingleWorkspaceExists: PropTypes.bool,
    workspace: PropTypes.object,
    loading: PropTypes.bool
};

export default withRouter(withStyles(styles)(ContextualWorkspaceInformationDrawer));
