import React from 'react';
import {NavLink, withRouter} from "react-router-dom";
import {Divider, Icon, List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";

import Config from '../common/services/Config';
import {projectPrefix} from "../projects/projects";


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
                    <Icon>widgets</Icon>
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
                    <Icon>home</Icon>
                </ListItemIcon>
                <ListItemText primary="Overview" />
            </ListItem>
            <ListItem
                component={NavLink}
                to={projectPrefix() + "/collections"}
                button
                selected={pathname.startsWith(projectPrefix() + '/collections')}
            >
                <ListItemIcon>
                    <Icon>folder_open</Icon>
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
                        <Icon>bar_chart</Icon>
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
                    <Icon>assignment</Icon>
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
                    <Icon>code</Icon>
                </ListItemIcon>
                <ListItemText primary="Vocabulary" />
            </ListItem>
            <ListItem
                component={NavLink}
                to={projectPrefix() + "/users"}
                button
                selected={pathname.startsWith(projectPrefix() + '/users')}
            >
                <ListItemIcon>
                    <Icon>group</Icon>
                </ListItemIcon>
                <ListItemText primary="Users" />
            </ListItem>
        </List>
        <Divider />
        <List>
            {Config.get().urls.dataverse ? (
                <ListItem button component="a" href={Config.get().urls.dataverse}>
                    <ListItemIcon>
                        <Icon>open_in_new</Icon>
                    </ListItemIcon>
                    <ListItemText primary="Dataverse" />
                </ListItem>
            ) : null}
            {Config.get().urls.cbioportal ? (
                <ListItem component="a" href={Config.get().urls.cbioportal} button>
                    <ListItemIcon>
                        <Icon>open_in_new</Icon>
                    </ListItemIcon>
                    <ListItemText primary="cBioportal" />
                </ListItem>
            ) : null}
        </List>
    </>
);

export default withRouter(ProjectMenu);
