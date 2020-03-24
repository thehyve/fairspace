import React, {useContext} from 'react';
import {withStyles} from '@material-ui/core';
import {withRouter} from 'react-router-dom';
import PropTypes from "prop-types";

import styles from '../common/components/InformationDrawer.styles';
import EmptyInformationDrawer from "../common/components/EmptyInformationDrawer";
import WorkspaceContext from "./WorkspaceContext";
import WorkspaceDetails from "./WorkspaceDetails";


export const WorkspaceInformationDrawer = ({workspace, loading, atLeastSingleWorkspaceExists}) => {
    if (!workspace && !loading && atLeastSingleWorkspaceExists) {
        return <EmptyInformationDrawer message="Select a workspace to display its metadata" />;
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
    const {loading, workspaces} = useContext(WorkspaceContext);
    const workspace = workspaces.find(c => c.iri === selectedWorkspaceIri);
    const atLeastSingleWorkspaceExists = workspaces.length > 0;
    return (
        <WorkspaceInformationDrawer
            {...props}
            loading={loading}
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
