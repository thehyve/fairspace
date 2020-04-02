// @flow
import React from 'react';
import {withRouter} from 'react-router-dom';
import {Card, CardContent, CardHeader} from "@material-ui/core";
import {Widgets} from "@material-ui/icons";
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

    const renderWorkspaceSettingsCard = () => (
        <Card>
            <CardHeader
                titleTypographyProps={{variant: 'h6'}}
                title={workspace.id}
                avatar={(
                    <Widgets />
                )}
            />
            <CardContent style={{paddingTop: 0}}>
                {/* TODO add status handling */}
            </CardContent>
        </Card>
    );

    const renderWorkspacePermissionsCard = () => (
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
    );

    return (
        <>
            {renderWorkspaceSettingsCard()}
            {renderWorkspacePermissionsCard()}
        </>
    );
};

export default withRouter(WorkspaceDetails);
