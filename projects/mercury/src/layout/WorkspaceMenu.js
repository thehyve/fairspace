import React, {useContext} from 'react';
import {NavLink, withRouter} from "react-router-dom";
import {Divider, List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Assignment, Code, FolderOpen, OpenInNew} from "@material-ui/icons";
import WorkspaceListMenuItem from "./WorkspaceListMenuItem";
import ServicesContext from "../common/contexts/ServicesContext";

const WorkspaceMenu = ({location: {pathname}}) => {
    const {services} = useContext(ServicesContext);
    return (
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
            </List>

            <div>
                <Divider />
                <List>
                    {
                        Object.keys(services).map(key => (
                            <ListItem button component="a" href={services[key]}>
                                <ListItemIcon>
                                    <OpenInNew />
                                </ListItemIcon>
                                <ListItemText primary={key} />
                            </ListItem>
                        ))
                    }
                </List>
            </div>
        </>
    );
};

export default withRouter(WorkspaceMenu);
