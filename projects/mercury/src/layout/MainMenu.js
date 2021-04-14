import React, {useContext} from 'react';
import {NavLink} from "react-router-dom";
import {Divider, List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Assignment, Folder, FolderSpecial, OpenInNew, VerifiedUser, Widgets} from "@material-ui/icons";
import ServicesContext from "../common/contexts/ServicesContext";
import UserContext from "../users/UserContext";
import {isAdmin} from "../users/userUtils";
import MetadataViewContext from "../metadata/views/MetadataViewContext";
import ExternalStoragesContext from "../external-storage/ExternalStoragesContext";
import {getExternalStoragePathPrefix} from "../external-storage/externalStorageUtils";

export default () => {
    const {pathname} = window.location;
    const {services} = useContext(ServicesContext);
    const {currentUser} = useContext(UserContext);
    const {externalStorages} = useContext(ExternalStoragesContext);
    const {views} = useContext(MetadataViewContext);
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
                {externalStorages && externalStorages.map(storage => (
                    <ListItem
                        key={getExternalStoragePathPrefix(storage.name)}
                        component={NavLink}
                        to={getExternalStoragePathPrefix(storage.name)}
                        button
                        selected={pathname.startsWith(getExternalStoragePathPrefix(storage.name))}
                    >
                        <ListItemIcon>
                            <FolderSpecial />
                        </ListItemIcon>
                        <ListItemText primary={storage.label} />
                    </ListItem>
                ))}
                {views && views.length > 0 && currentUser.canViewPublicMetadata && (
                    <ListItem
                        key="metadata-views"
                        component={NavLink}
                        to="/metadata-views"
                        button
                        selected={pathname.startsWith('/metadata-views')}
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
                            <ListItem button component="a" target="_blank" href={interpolate(services[key])} key={'service-' + key}>
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
