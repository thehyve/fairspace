// @flow
import React from 'react';
import {withRouter} from 'react-router-dom';
import {Card, CardContent, CardHeader} from "@material-ui/core";
import {Widgets} from "@material-ui/icons";
import PermissionContext, {PermissionProvider} from "../permissions/PermissionContext";
import PermissionsCard from "../permissions/PermissionsCard";
import type {Workspace} from "./WorkspacesAPI";
import LoadingInlay from "../common/components/LoadingInlay";

type WorkspaceDetailsProps = {
    loading: boolean;
    workspace: Workspace;
};

const WorkspaceDetails = (props: WorkspaceDetailsProps) => {
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
