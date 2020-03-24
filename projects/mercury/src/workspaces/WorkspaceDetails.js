// @flow
import React from 'react';
import {withRouter} from 'react-router-dom';
import {LoadingInlay} from '../common';
import PermissionContext, {PermissionProvider} from "../common/contexts/PermissionContext";
import PermissionsCard from "../permissions/PermissionsCard";
import type {Workspace} from "./WorkspacesAPI";


type WorkspaceDetailsProps = {
    loading: boolean;
    workspace: Workspace;
};

export const WorkspaceDetails = (props: WorkspaceDetailsProps) => {
    const {loading, workspace} = props;

    if (loading) {
        return <LoadingInlay />;
    }

    return (
        <>
            <PermissionProvider iri={workspace.iri}>
                <PermissionContext.Consumer>
                    {({permissions}) => (
                        <PermissionsCard
                            permissions={permissions}
                            iri={workspace.iri}
                            canManage={workspace.canManage}
                        />
                    )}
                </PermissionContext.Consumer>
            </PermissionProvider>
        </>
    );
};

const ContextualWorkspaceDetails = (props) => (// TODO required context
    <WorkspaceDetails
        {...props}
    />
);

export default withRouter(ContextualWorkspaceDetails);
