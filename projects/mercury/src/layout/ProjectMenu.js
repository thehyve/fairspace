import React from 'react';
import {NavLink, withRouter} from "react-router-dom";
import {Divider, List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Assignment, BarChart, Code, FolderOpen, Group, Home, OpenInNew, Widgets} from "@material-ui/icons";

import Config from '../common/services/Config';
import {projectPrefix} from "../projects/projects";
import AuthorizationCheck from "../common/components/AuthorizationCheck";


const ProjectMenu = ({location: {pathname}}) => (
    <>
        <List>
            <ListItem
                component={NavLink}
                to="/projects"
                button
                selected={pathname === '/projects'}
            >
                <ListItemIcon>
                    <Widgets />
                </ListItemIcon>
                <ListItemText primary="Projects" />
            </ListItem>
        </List>
        <Divider />
        <List>
            <ListItem
                component={NavLink}
                exact
                to={projectPrefix() + "/"}
                button
                selected={pathname === projectPrefix() + "/"}
            >
                <ListItemIcon>
                    <Home />
                </ListItemIcon>
                <ListItemText primary="Overview" />
            </ListItem>
            <AuthorizationCheck requiredAuthorization="CanRead" transformError={() => null}>
                <ListItem
                    component={NavLink}
                    to={projectPrefix() + "/collections"}
                    button
                    selected={pathname.startsWith(projectPrefix() + '/collections')}
                >
                    <ListItemIcon>
                        <FolderOpen />
                    </ListItemIcon>
                    <ListItemText primary="Collections" />
                </ListItem>
                {Config.get().urls.jupyterhub ? (
                    <ListItem
                        component={NavLink}
                        to={projectPrefix() + "/notebooks"}
                        button
                        selected={pathname.startsWith(projectPrefix() + '/notebooks')}
                    >
                        <ListItemIcon>
                            <BarChart />
                        </ListItemIcon>
                        <ListItemText primary="Notebooks" />
                    </ListItem>
                ) : null}
                <ListItem
                    component={NavLink}
                    to={projectPrefix() + "/metadata"}
                    button
                >
                    <ListItemIcon>
                        <Assignment />
                    </ListItemIcon>
                    <ListItemText primary="Metadata" />
                </ListItem>
                <ListItem
                    component={NavLink}
                    to={projectPrefix() + "/vocabulary"}
                    button
                    selected={pathname.startsWith(projectPrefix() + '/vocabulary')}
                >
                    <ListItemIcon>
                        <Code />
                    </ListItemIcon>
                    <ListItemText primary="Vocabulary" />
                </ListItem>
            </AuthorizationCheck>
            <ListItem
                component={NavLink}
                to={projectPrefix() + "/users"}
                button
                selected={pathname.startsWith(projectPrefix() + '/users')}
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

export default withRouter(ProjectMenu);
