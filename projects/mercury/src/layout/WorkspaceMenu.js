import React from 'react';
import {NavLink, withRouter} from "react-router-dom";
import {Divider, List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Assignment, BarChart, Code, FolderOpen, Group, Home, OpenInNew} from "@material-ui/icons";

import Config from '../common/services/Config';
import {workspacePrefix} from "../workspaces/workspaces";
import AuthorizationCheck from "../common/components/AuthorizationCheck";
import WorkspaceListMenuItem from "./WorkspaceListMenuItem";


const WorkspaceMenu = ({location: {pathname}}) => (
    <>
        <WorkspaceListMenuItem location={pathname} />
        <Divider />
        <List>
            <ListItem
                component={NavLink}
                exact
                to={workspacePrefix() + "/"}
                button
                selected={pathname === workspacePrefix() + "/"}
            >
                <ListItemIcon>
                    <Home />
                </ListItemIcon>
                <ListItemText primary="Overview" />
            </ListItem>
            <AuthorizationCheck requiredAuthorization="CanRead" transformError={() => null}>
                <ListItem
                    component={NavLink}
                    to={workspacePrefix() + "/collections"}
                    button
                    selected={pathname.startsWith(workspacePrefix() + '/collections')}
                >
                    <ListItemIcon>
                        <FolderOpen />
                    </ListItemIcon>
                    <ListItemText primary="Collections" />
                </ListItem>
                {Config.get().urls.jupyterhub ? (
                    <ListItem
                        component={NavLink}
                        to={workspacePrefix() + "/notebooks"}
                        button
                        selected={pathname.startsWith(workspacePrefix() + '/notebooks')}
                    >
                        <ListItemIcon>
                            <BarChart />
                        </ListItemIcon>
                        <ListItemText primary="Notebooks" />
                    </ListItem>
                ) : null}
                <ListItem
                    component={NavLink}
                    to={workspacePrefix() + "/metadata"}
                    button
                >
                    <ListItemIcon>
                        <Assignment />
                    </ListItemIcon>
                    <ListItemText primary="Metadata" />
                </ListItem>
                <ListItem
                    component={NavLink}
                    to={workspacePrefix() + "/vocabulary"}
                    button
                    selected={pathname.startsWith(workspacePrefix() + '/vocabulary')}
                >
                    <ListItemIcon>
                        <Code />
                    </ListItemIcon>
                    <ListItemText primary="Vocabulary" />
                </ListItem>
            </AuthorizationCheck>
            <ListItem
                component={NavLink}
                to={workspacePrefix() + "/users"}
                button
                selected={pathname.startsWith(workspacePrefix() + '/users')}
            >
                <ListItemIcon>
                    <Group />
                </ListItemIcon>
                <ListItemText primary="Users" />
            </ListItem>
        </List>
        <AuthorizationCheck requiredAuthorization="CanRead" transformError={() => null}>
            <Divider />
            <List>
                {Config.get().urls.dataverse ? (
                    <ListItem button component="a" href={Config.get().urls.dataverse}>
                        <ListItemIcon>
                            <OpenInNew />
                        </ListItemIcon>
                        <ListItemText primary="Dataverse" />
                    </ListItem>
                ) : null}
                {Config.get().urls.cbioportal ? (
                    <ListItem component="a" href={Config.get().urls.cbioportal} button>
                        <ListItemIcon>
                            <OpenInNew />
                        </ListItemIcon>
                        <ListItemText primary="cBioportal" />
                    </ListItem>
                ) : null}
            </List>
        </AuthorizationCheck>
    </>
);

export default withRouter(WorkspaceMenu);
