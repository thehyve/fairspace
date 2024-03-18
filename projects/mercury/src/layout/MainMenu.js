import React, {useContext} from 'react';
import withStyles from '@mui/styles/withStyles';
import {NavLink} from 'react-router-dom';
import {Divider, List, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import {Search, SavedSearch, Folder, FolderSpecial, OpenInNew, VerifiedUser, Widgets} from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import ServicesContext from '../common/contexts/ServicesContext';
import UserContext from '../users/UserContext';
import {isAdmin} from '../users/userUtils';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import ExternalStoragesContext from '../external-storage/ExternalStoragesContext';
import ExternalMetadataSourceContext from '../metadata/external-sources/ExternalMetadataSourceContext';
import {getExternalStoragePathPrefix} from '../external-storage/externalStorageUtils';
import {getExternalMetadataSourcePathPrefix} from '../metadata/external-sources/externalMetadataSourceUtils';
import {METADATA_VIEW_MENU_LABEL} from '../constants';

const styles = {
    mainMenuButton: {
        paddingTop: 15,
        paddingBottom: 15
    }
};
const MainMenu = ({classes}) => {
    const {pathname} = window.location;
    const {services} = useContext(ServicesContext);
    const {currentUser} = useContext(UserContext);
    const {externalStorages} = useContext(ExternalStoragesContext);
    const {externalMetadataSources} = useContext(ExternalMetadataSourceContext);
    const {views} = useContext(MetadataViewContext);
    // eslint-disable-next-line no-template-curly-in-string
    const interpolate = s => s.replace('${username}', currentUser.username);
    return (
        <>
            <List>
                <ListItemButton
                    className={classes.mainMenuButton}
                    component={NavLink}
                    to="/dashboard"
                    selected={pathname.startsWith('/dashboard')}
                >
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                <ListItemButton
                    className={classes.mainMenuButton}
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
                    className={classes.mainMenuButton}
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
                {externalStorages &&
                    externalStorages.map(storage => (
                        <ListItemButton
                            className={classes.mainMenuButton}
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
                        className={classes.mainMenuButton}
                        key="metadata-views"
                        component={NavLink}
                        to="/metadata-views"
                        selected={pathname.startsWith('/metadata-views')}
                    >
                        <ListItemIcon>
                            <Search />
                        </ListItemIcon>
                        <ListItemText primary={METADATA_VIEW_MENU_LABEL} />
                    </ListItemButton>
                )}
                {currentUser.canViewPublicMetadata &&
                    externalMetadataSources &&
                    externalMetadataSources.map(source => (
                        <ListItemButton
                            className={classes.mainMenuButton}
                            key={getExternalMetadataSourcePathPrefix(source.name)}
                            component={NavLink}
                            to={getExternalMetadataSourcePathPrefix(source.name)}
                            selected={pathname.startsWith(getExternalMetadataSourcePathPrefix(source.name))}
                        >
                            <ListItemIcon>
                                <SavedSearch />
                            </ListItemIcon>
                            <ListItemText primary={source.label} />
                        </ListItemButton>
                    ))}
                {isAdmin(currentUser) && (
                    <ListItemButton
                        className={classes.mainMenuButton}
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
                    {Object.keys(services).map(key => (
                        <ListItemButton
                            className={classes.mainMenuButton}
                            component="a"
                            target="_blank"
                            href={interpolate(services[key])}
                            key={'service-' + key}
                        >
                            <ListItemIcon>
                                <OpenInNew />
                            </ListItemIcon>
                            <ListItemText primary={key} />
                        </ListItemButton>
                    ))}
                </List>
            </div>
        </>
    );
};

export default withStyles(styles)(MainMenu);
