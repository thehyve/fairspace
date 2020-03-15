import React from 'react';
import {NavLink, withRouter} from "react-router-dom";
import {Divider, List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Assignment, BarChart, Code, FolderOpen, Group, OpenInNew} from "@material-ui/icons";

import Config from '../common/services/Config';
import {workspacePrefix} from "../workspaces/workspaces";
import WorkspaceListMenuItem from "./WorkspaceListMenuItem";

const WorkspaceMenu = ({location: {pathname}}) => (
    <>
        <WorkspaceListMenuItem location={pathname} />
        <List>
            <ListItem
                component={NavLink}
                to="/collections"
                button
                selected={pathname.startsWith('/collections')}
            >
                <ListItemIcon>
                    <FolderOpen />
                </ListItemIcon>
                <ListItemText primary="Collections" />
            </ListItem>
            {Config.get().urls.jupyterhub ? (
                <ListItem
                    component={NavLink}
                    to="/notebooks"
                    button
                    selected={pathname.startsWith('/notebooks')}
                >
                    <ListItemIcon>
                        <BarChart />
                    </ListItemIcon>
                    <ListItemText primary="Notebooks" />
                </ListItem>
            ) : null}
            <ListItem
                component={NavLink}
                to="/metadata"
                button
            >
                <ListItemIcon>
                    <Assignment />
                </ListItemIcon>
                <ListItemText primary="Metadata" />
            </ListItem>
            <ListItem
                component={NavLink}
                to="/vocabulary"
                button
                selected={pathname.startsWith('/vocabulary')}
            >
                <ListItemIcon>
                    <Code />
                </ListItemIcon>
                <ListItemText primary="Vocabulary" />
            </ListItem>
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

        <div>
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
        </div>
    </>
);

export default withRouter(WorkspaceMenu);
