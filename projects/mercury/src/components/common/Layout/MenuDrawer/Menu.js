import React from 'react';
import {withRouter, NavLink} from "react-router-dom";
import {List, ListItem, ListItemIcon, ListItemText, Divider, Icon} from "@material-ui/core";

import Config from '../../../../services/Config/Config';

const Menu = ({location: {pathname}}) => (
    <>
        <List>
            <ListItem
                component={NavLink}
                exact
                to="/"
                button
                selected={pathname === '/'}
            >
                <ListItemIcon>
                    <Icon>home</Icon>
                </ListItemIcon>
                <ListItemText primary="Home" />
            </ListItem>
            <ListItem
                component={NavLink}
                to="/collections"
                button
                selected={pathname.startsWith('/collections')}
            >
                <ListItemIcon>
                    <Icon>folder_open</Icon>
                </ListItemIcon>
                <ListItemText primary="Collections" />
            </ListItem>
            <ListItem
                component={NavLink}
                to="/notebooks"
                button
                selected={pathname.startsWith('/notebooks')}
            >
                <ListItemIcon>
                    <Icon>bar_chart</Icon>
                </ListItemIcon>
                <ListItemText primary="Notebooks" />
            </ListItem>
            <ListItem
                component={NavLink}
                to="/metadata"
                button
                selected={pathname.startsWith('/metadata')}
            >
                <ListItemIcon>
                    <Icon>assignment</Icon>
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
                    <Icon>code</Icon>
                </ListItemIcon>
                <ListItemText primary="Vocabulary" />
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
            ) : null }
            {Config.get().urls.cbioportal ? (
                <ListItem component="a" href={Config.get().urls.cbioportal} button>
                    <ListItemIcon>
                        <Icon>open_in_new</Icon>
                    </ListItemIcon>
                    <ListItemText primary="cBioportal" />
                </ListItem>
            ) : null }
        </List>
    </>
);

export default withRouter(Menu);
