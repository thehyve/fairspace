import React from 'react';
import {NavLink, withRouter} from "react-router-dom";
import {List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Widgets} from "@material-ui/icons";


const WorkspaceListMenuItem = ({location: {pathname}}) => (
    <>
        <List>
            <ListItem
                component={NavLink}
                to="/workspaces"
                button
                selected={pathname === '/workspaces'}
            >
                <ListItemIcon>
                    <Widgets />
                </ListItemIcon>
                <ListItemText primary="Workspaces" />
            </ListItem>
        </List>
    </>
);

export default withRouter(WorkspaceListMenuItem);
