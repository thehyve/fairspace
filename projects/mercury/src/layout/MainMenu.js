import React, {useContext} from 'react';
import withStyles from '@mui/styles/withStyles';
import classNames from 'classnames';
import {NavLink} from 'react-router-dom';
import {Button, Icon, Stack} from '@mui/material';
import {Search, SavedSearch, Folder, FolderSpecial, OpenInNew, VerifiedUser, Widgets} from '@mui/icons-material';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import FeaturesContext from '../common/contexts/FeaturesContext';
import ServicesContext from '../common/contexts/ServicesContext';
import UserContext from '../users/UserContext';
import {isAdmin} from '../users/userUtils';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import ExternalStoragesContext from '../external-storage/ExternalStoragesContext';
import ExternalMetadataSourceContext from '../metadata/metadata-sources/ExternalMetadataSourceContext';
import {getExternalStoragePathPrefix} from '../external-storage/externalStorageUtils';
import {getExternalMetadataSourcePathPrefix} from '../metadata/external-views/externalMetadataSourceUtils';
import InternalMetadataSourceContext from '../metadata/metadata-sources/InternalMetadataSourceContext';
import {COLORS} from '../App.theme';

const styles = theme => ({
    buttonStack: {
        paddingLeft: 20,
        paddingRight: 20,
        overflowY: 'auto'
    },
    buttonStackCollapsed: {
        paddingLeft: 10,
        paddingRight: 10
    },
    mainMenuButton: {
        paddingTop: 15,
        paddingBottom: 15,
        textAlign: 'center',
        color: theme.palette.primary.contrastText,
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
    mainMenuButtonSelected: {
        backgroundColor: COLORS.fsBlueLightTransp25
    },
    imageIcon: {
        display: 'flex',
        height: 'inherit',
        width: 'inherit'
    },
    iconRoot: {
        textAlign: 'center'
    }
});
const MainMenu = ({open, classes}) => {
    const {pathname} = window.location;
    const {services} = useContext(ServicesContext);
    const {currentUser} = useContext(UserContext);
    const {externalStorages} = useContext(ExternalStoragesContext);
    const {externalMetadataSources} = useContext(ExternalMetadataSourceContext);
    const {internalMetadataIcon, internalMetadataLabel} = useContext(InternalMetadataSourceContext);
    const {views} = useContext(MetadataViewContext);
    const {isFeatureEnabled} = useContext(FeaturesContext);
    const useLlmSearch = isFeatureEnabled('LlmSearch');

    // eslint-disable-next-line no-template-curly-in-string
    const interpolate = s => s.replace('${username}', currentUser.username);
    return (
        <>
            <Stack spacing={1.5} className={open ? classes.buttonStack : classes.buttonStackCollapsed}>
                <Button
                    variant="outlined"
                    size="small"
                    className={classNames(
                        classes.mainMenuButton,
                        !open && classes.mainMenuButtonSmall,
                        pathname.startsWith('/dashboard') && classes.mainMenuButtonSelected
                    )}
                    component={NavLink}
                    to="/dashboard"
                    startIcon={<HomeIcon />}
                >
                    {open && 'Home'}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    className={classNames(
                        classes.mainMenuButton,
                        !open && classes.mainMenuButtonSmall,
                        pathname.startsWith('/workspace') && classes.mainMenuButtonSelected
                    )}
                    component={NavLink}
                    to="/workspaces"
                    startIcon={<Widgets />}
                >
                    {open ? 'Workspaces' : null}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    className={classNames(
                        classes.mainMenuButton,
                        !open && classes.mainMenuButtonSmall,
                        pathname.startsWith('/collections') && classes.mainMenuButtonSelected
                    )}
                    key="collections"
                    component={NavLink}
                    to="/collections"
                    startIcon={<Folder />}
                >
                    {open && 'Collections'}
                </Button>
                {useLlmSearch && (
                    <Button
                        variant="outlined"
                        size="small"
                        className={classNames(
                            classes.mainMenuButton,
                            !open && classes.mainMenuButtonSmall,
                            pathname.startsWith('/search') && classes.mainMenuButtonSelected
                        )}
                        key="search"
                        component={NavLink}
                        to="/ask"
                        startIcon={<ChatIcon />}
                    >
                        {open && 'Chat'}
                    </Button>
                )}
                {externalStorages &&
                    externalStorages.map(storage => (
                        <Button
                            variant="outlined"
                            size="small"
                            className={classNames(
                                classes.mainMenuButton,
                                !open && classes.mainMenuButtonSmall,
                                pathname.startsWith(getExternalStoragePathPrefix(storage.name)) &&
                                    classes.mainMenuButtonSelected
                            )}
                            key={getExternalStoragePathPrefix(storage.name)}
                            component={NavLink}
                            to={getExternalStoragePathPrefix(storage.name)}
                            startIcon={<FolderSpecial />}
                        >
                            {open && storage.label}
                        </Button>
                    ))}
                {views && views.length > 0 && currentUser.canViewPublicMetadata && (
                    <Button
                        variant="outlined"
                        size="small"
                        className={classNames(
                            classes.mainMenuButton,
                            !open && classes.mainMenuButtonSmall,
                            pathname.startsWith('/metadata-views') && classes.mainMenuButtonSelected
                        )}
                        key="metadata-views"
                        component={NavLink}
                        to="/metadata-views"
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
                            className={classNames(
                                classes.mainMenuButton,
                                !open && classes.mainMenuButtonSmall,
                                pathname.startsWith(getExternalMetadataSourcePathPrefix(source.name)) &&
                                    classes.mainMenuButtonSelected
                            )}
                            key={getExternalMetadataSourcePathPrefix(source.name)}
                            component={NavLink}
                            to={getExternalMetadataSourcePathPrefix(source.name)}
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
                        className={classNames(
                            classes.mainMenuButton,
                            !open && classes.mainMenuButtonSmall,
                            pathname.startsWith('/users') && classes.mainMenuButtonSelected
                        )}
                        key="users"
                        component={NavLink}
                        to="/users"
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
