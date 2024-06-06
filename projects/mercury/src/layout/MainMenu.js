import React, {useContext} from 'react';
import withStyles from '@mui/styles/withStyles';
import {NavLink} from 'react-router-dom';
import {Divider, Icon, List, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import {Search, SavedSearch, Folder, FolderSpecial, OpenInNew, VerifiedUser, Widgets} from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import ServicesContext from '../common/contexts/ServicesContext';
import UserContext from '../users/UserContext';
import {isAdmin} from '../users/userUtils';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import ExternalStoragesContext from '../external-storage/ExternalStoragesContext';
import ExternalMetadataSourceContext from '../metadata/metadata-sources/ExternalMetadataSourceContext';
import {getExternalStoragePathPrefix} from '../external-storage/externalStorageUtils';
import {getExternalMetadataSourcePathPrefix} from '../metadata/external-views/externalMetadataSourceUtils';
import InternalMetadataSourceContext from '../metadata/metadata-sources/InternalMetadataSourceContext';

const styles = {
    mainMenuButton: {
        paddingTop: 15,
        paddingBottom: 15
    },
    imageIcon: {
        display: 'flex',
        height: 'inherit',
        width: 'inherit'
    },
    coreMenuImageIcon: {
        opacity: 0.6
    },
    iconRoot: {
        textAlign: 'center'
    }
};
const MainMenu = ({classes}) => {
    const {pathname} = window.location;
    const {services} = useContext(ServicesContext);
    const {currentUser} = useContext(UserContext);
    const {externalStorages} = useContext(ExternalStoragesContext);
    const {externalMetadataSources} = useContext(ExternalMetadataSourceContext);
    const {internalMetadataIcon, internalMetadataLabel} = useContext(InternalMetadataSourceContext);
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
                            {internalMetadataIcon ? (
                                <Icon classes={{root: classes.iconRoot}}>
                                    <img
                                        alt="Metadata"
                                        src={internalMetadataIcon}
                                        className={`${classes.imageIcon} ${classes.coreMenuImageIcon}`}
                                    />
                                </Icon>
                            ) : (
                                <Search />
                            )}
                        </ListItemIcon>
                        <ListItemText primary={internalMetadataLabel} />
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
                                {source.icon ? (
                                    <Icon classes={{root: classes.iconRoot}}>
                                        <img
                                            alt={source.name}
                                            src={source.icon}
                                            className={`${classes.imageIcon} ${classes.coreMenuImageIcon}`}
                                        />
                                    </Icon>
                                ) : (
                                    <SavedSearch />
                                )}
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
                    {services.map(service => (
                        <ListItemButton
                            className={classes.mainMenuButton}
                            component="a"
                            target="_blank"
                            href={interpolate(service.url)}
                            key={'service-' + service.name}
                        >
                            <ListItemIcon>
                                {service.icon ? (
                                    <Icon classes={{root: classes.iconRoot}}>
                                        <img alt={service.name} src={service.icon} className={classes.imageIcon} />
                                    </Icon>
                                ) : (
                                    <OpenInNew />
                                )}
                            </ListItemIcon>
                            <ListItemText primary={service.name} />
                        </ListItemButton>
                    ))}
                </List>
            </div>
        </>
    );
};

export default withStyles(styles)(MainMenu);
