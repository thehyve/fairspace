// @flow
import React, {useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {Card, CardContent, CardHeader, Grid, withStyles} from "@material-ui/core";
import {Widgets} from "@material-ui/icons";
import PermissionContext, {PermissionProvider} from "../permissions/PermissionContext";
import PermissionsCard from "../permissions/PermissionsCard";
import type {Workspace} from "./WorkspacesAPI";
import LoadingInlay from "../common/components/LoadingInlay";
import UserContext from "../users/UserContext";
import {isAdmin} from "../users/userUtils";
import WorkspaceStatusFormContainer from "./WorkspaceStatusFormContainer";


const styles = {
    statusLabel: {
        color: 'gray'
    },
    statusText: {
        fontSize: 'small',
        margin: 0,
        paddingInlineStart: 2
    },
    statusCard: {
        paddingTop: 0
    }
};

type WorkspaceDetailsProps = {
    loading: boolean;
    workspace: Workspace;
    classes: Object;
};

const WorkspaceDetails = (props: WorkspaceDetailsProps) => {
    const {loading, workspace, refreshWorkspaces, classes} = props;
    const {currentUser} = useContext(UserContext);

    if (loading) {
        return <LoadingInlay />;
    }

    function renderWorkspaceStatus() {
        return (
            <Grid container direction="row">
                <Grid item xs={11}>
                    <Grid container>
                        <Grid item xs={12}>
                            {isAdmin(currentUser) ? (
                                <WorkspaceStatusFormContainer workspaceIri={workspace.iri} refreshWorkspaces={refreshWorkspaces} />
                            ) : (
                                <div>
                                    <legend className={classes.statusLabel}>Status</legend>
                                    <p className={classes.statusText}>{workspace.status}</p>
                                </div>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
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
            <CardContent className={classes.statusCard}>
                {renderWorkspaceStatus()}
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

export default withRouter(withStyles(styles)(WorkspaceDetails));
