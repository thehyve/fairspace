import React, {useContext} from 'react';
import withStyles from '@mui/styles/withStyles';
import classNames from 'classnames';
import {NavLink} from 'react-router-dom';
import {Button, Icon, Stack} from '@mui/material';
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
    buttonStack: {
        paddingLeft: 20,
        paddingRight: 20
    },
    buttonStackCollapsed: {
        paddingLeft: 10,
        paddingRight: 10
    },
    mainMenuButton: {
        paddingTop: 15,
        paddingBottom: 15,
        textAlign: 'center',
        color: 'white',
        height: 40
    },
    mainMenuButtonSmall: {
        minWidth: 40,
        width: 40,
        borderRadius: 20,
        '& .MuiButton-startIcon': {
            marginRight: 0,
            marginLeft: 0
        }
    },
    imageIcon: {
        display: 'flex',
        height: 'inherit',
        width: 'inherit'
    },
    iconRoot: {
        textAlign: 'center'
    }
};
const MainMenu = ({open, classes}) => {
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
            <Stack spacing={1.5} className={open ? classes.buttonStack : classes.buttonStackCollapsed}>
                <Button
                    variant="outlined"
                    size="small"
                    className={classNames(classes.mainMenuButton, !open && classes.mainMenuButtonSmall)}
                    component={NavLink}
                    to="/dashboard"
                    selected={pathname.startsWith('/dashboard')}
                    startIcon={<HomeIcon />}
                >
                    {open && 'Home'}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    className={classNames(classes.mainMenuButton, !open && classes.mainMenuButtonSmall)}
                    component={NavLink}
                    to="/workspaces"
                    selected={pathname.startsWith('/workspace')}
                    startIcon={<Widgets />}
                >
                    {open ? 'Workspaces' : null}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    className={classNames(classes.mainMenuButton, !open && classes.mainMenuButtonSmall)}
                    key="collections"
                    component={NavLink}
                    to="/collections"
                    selected={pathname.startsWith('/collections')}
                    startIcon={<Folder />}
                >
                    {open && 'Collections'}
                </Button>
                {externalStorages &&
                    externalStorages.map(storage => (
                        <Button
                            variant="outlined"
                            size="small"
                            className={classNames(classes.mainMenuButton, !open && classes.mainMenuButtonSmall)}
                            key={getExternalStoragePathPrefix(storage.name)}
                            component={NavLink}
                            to={getExternalStoragePathPrefix(storage.name)}
                            selected={pathname.startsWith(getExternalStoragePathPrefix(storage.name))}
                            startIcon={<FolderSpecial />}
                        >
                            {open && storage.label}
                        </Button>
                    ))}
                {views && views.length > 0 && currentUser.canViewPublicMetadata && (
                    <Button
                        variant="outlined"
                        size="small"
                        className={classNames(classes.mainMenuButton, !open && classes.mainMenuButtonSmall)}
                        key="metadata-views"
                        component={NavLink}
                        to="/metadata-views"
                        selected={pathname.startsWith('/metadata-views')}
                        startIcon={
                            internalMetadataIcon ? (
                                <Icon classes={{root: classes.iconRoot}}>
                                    <img alt="Metadata" src={internalMetadataIcon} className={classes.imageIcon} />
                                </Icon>
                            ) : (
                                <Search />
                            )
                        }
                    >
                        {open && internalMetadataLabel}
                    </Button>
                )}
                {currentUser.canViewPublicMetadata &&
                    externalMetadataSources &&
                    externalMetadataSources.map(source => (
                        <Button
                            variant="outlined"
                            size="small"
                            className={classNames(classes.mainMenuButton, !open && classes.mainMenuButtonSmall)}
                            key={getExternalMetadataSourcePathPrefix(source.name)}
                            component={NavLink}
                            to={getExternalMetadataSourcePathPrefix(source.name)}
                            selected={pathname.startsWith(getExternalMetadataSourcePathPrefix(source.name))}
                            startIcon={
                                source.icon ? (
                                    <Icon classes={{root: classes.iconRoot}}>
                                        <img
                                            alt={source.name}
                                            src={source.icon}
                                            className={`${classes.imageIcon} ${classes.coreMenuImageIcon}`}
                                        />
                                    </Icon>
                                ) : (
                                    <SavedSearch />
                                )
                            }
                        >
                            {open && source.label}
                        </Button>
                    ))}
                {isAdmin(currentUser) && (
                    <Button
                        variant="outlined"
                        size="small"
                        className={classNames(classes.mainMenuButton, !open && classes.mainMenuButtonSmall)}
                        key="users"
                        component={NavLink}
                        to="/users"
                        selected={pathname.startsWith('/users')}
                        startIcon={<VerifiedUser />}
                    >
                        {open && 'Users'}
                    </Button>
                )}
            </Stack>
            <Stack
                spacing={1.5}
                className={open ? classes.buttonStack : classes.buttonStackCollapsed}
                style={{paddingTop: 30}}
            >
                {services.map(service => (
                    <Button
                        variant="outlined"
                        size="small"
                        className={classNames(classes.mainMenuButton, !open && classes.mainMenuButtonSmall)}
                        component="a"
                        target="_blank"
                        href={interpolate(service.url)}
                        key={'service-' + service.name}
                        startIcon={
                            service.icon ? (
                                <Icon classes={{root: classes.iconRoot}}>
                                    <img alt={service.name} src={service.icon} className={classes.imageIcon} />
                                </Icon>
                            ) : (
                                <OpenInNew />
                            )
                        }
                    >
                        {open && service.name}
                    </Button>
                ))}
            </Stack>
        </>
    );
};

export default withStyles(styles)(MainMenu);
