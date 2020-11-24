import React, {useContext} from 'react';
import {NavLink} from "react-router-dom";
import {Divider, List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Assignment, Folder, OpenInNew, VerifiedUser, Widgets} from "@material-ui/icons";
import ServicesContext from "../common/contexts/ServicesContext";
import UserContext from "../users/UserContext";
import {isAdmin} from "../users/userUtils";
import FeaturesContext from "../common/contexts/FeaturesContext";
import MetadataViewContext from "../metadata/views/MetadataViewContext";

export default () => {
    const {pathname} = window.location;
    const {services} = useContext(ServicesContext);
    const {currentUser} = useContext(UserContext);
    const {isFeatureEnabled} = useContext(FeaturesContext);
    const {views = []} = useContext(MetadataViewContext);
    // eslint-disable-next-line no-template-curly-in-string
    const interpolate = s => s.replace('${username}', currentUser.username);
    return (
        <>
            <List>
                <ListItem
                    component={NavLink}
                    to="/workspaces"
                    button
                    selected={pathname.startsWith('/workspace')}
                >
                    <ListItemIcon>
                        <Widgets />
                    </ListItemIcon>
                    <ListItemText primary="Workspaces" />
                </ListItem>
                <ListItem
                    key="collections"
                    component={NavLink}
                    to="/collections"
                    button
                    selected={pathname.startsWith('/collections')}
                >
                    <ListItemIcon>
                        <Folder />
                    </ListItemIcon>
                    <ListItemText primary="Collections" />
                </ListItem>
                {currentUser && currentUser.canViewPublicMetadata
                && views.filter(v => v.name !== "collections").map(view => (
                    <ListItem
                        key={`views-${view.name}`}
                        component={NavLink}
                        to={`/views/${view.name}`}
                        button
                        selected={pathname.startsWith(`/views/${view.name}`)}
                    >
                        <ListItemIcon>
                            {view.icon}
                        </ListItemIcon>
                        <ListItemText style={{whiteSpace: 'normal'}} primary={view.title} />
                    </ListItem>
                ))}
                {isFeatureEnabled('MetadataEditing') && currentUser.canViewPublicMetadata && (
                    <ListItem
                        key="metadata"
                        component={NavLink}
                        to="/metadata"
                        button
                    >
                        <ListItemIcon>
                            <Assignment />
                        </ListItemIcon>
                        <ListItemText primary="Metadata" />
                    </ListItem>
                )}
                {isAdmin(currentUser) && (
                    <ListItem
                        key="users"
                        component={NavLink}
                        to="/users"
                        button
                        selected={pathname.startsWith('/users')}
                    >
                        <ListItemIcon>
                            <VerifiedUser />
                        </ListItemIcon>
                        <ListItemText primary="Users" />
                    </ListItem>
                )}
            </List>

            <div>
                <Divider />
                <List>
                    {
                        Object.keys(services).map(key => (
                            <ListItem button component="a" href={interpolate(services[key])} key={'service-' + key}>
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
