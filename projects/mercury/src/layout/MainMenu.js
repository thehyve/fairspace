import React, {useContext} from 'react';
import {NavLink} from "react-router-dom";
import {Divider, List, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {Assignment, Folder, FolderSpecial, OpenInNew, VerifiedUser, Widgets} from "@mui/icons-material";
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
                <ListItemButton
                    component={NavLink}
                    to="/workspaces"
                    selected={pathname.startsWith('/workspace')}
                >
                    <ListItemIcon>
                        <Widgets />
                    </ListItemIcon>
                    <ListItemText primary="Workspaces" />
                </ListItemButton>
                <ListItemButton
                    key="collections"
                    component={NavLink}
                    to="/collections"
                    selected={pathname.startsWith('/collections')}
                >
                    <ListItemIcon>
                        <Folder />
                    </ListItemIcon>
                    <ListItemText primary="Collections" />
                </ListItemButton>
                {externalStorages && externalStorages.map(storage => (
                    <ListItemButton
                        key={getExternalStoragePathPrefix(storage.name)}
                        component={NavLink}
                        to={getExternalStoragePathPrefix(storage.name)}
                        selected={pathname.startsWith(getExternalStoragePathPrefix(storage.name))}
                    >
                        <ListItemIcon>
                            <FolderSpecial />
                        </ListItemIcon>
                        <ListItemText primary={storage.label} />
                    </ListItemButton>
                ))}
                {views && views.length > 0 && currentUser.canViewPublicMetadata && (
                    <ListItemButton
                        key="metadata-views"
                        component={NavLink}
                        to="/metadata-views"
                        selected={pathname.startsWith('/metadata-views')}
                    >
                        <ListItemIcon>
                            <Assignment />
                        </ListItemIcon>
                        <ListItemText primary="Metadata" />
                    </ListItemButton>
                )}
                {isAdmin(currentUser) && (
                    <ListItemButton
                        key="users"
                        component={NavLink}
                        to="/users"
                        selected={pathname.startsWith('/users')}
                    >
                        <ListItemIcon>
                            <VerifiedUser />
                        </ListItemIcon>
                        <ListItemText primary="Users" />
                    </ListItemButton>
                )}
            </List>

            <div>
                <Divider />
                <List>
                    {
                        Object.keys(services).map(key => (
                            <ListItemButton component="a" target="_blank" href={interpolate(services[key])} key={'service-' + key}>
                                <ListItemIcon>
                                    <OpenInNew />
                                </ListItemIcon>
                                <ListItemText primary={key} />
                            </ListItemButton>
                        ))
                    }
                </List>
            </div>
        </>
    );
};
