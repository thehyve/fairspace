import React, {useContext, useState} from 'react';
import {
    Avatar,
    Button,
    Card,
    CardActions,
    CardContent,
    ClickAwayListener,
    Grow,
    IconButton,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Typography
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';

import {ErrorOutline} from '@mui/icons-material';
import ExitToApp from '@mui/icons-material/ExitToApp';
import UserContext from '../users/UserContext';
import LogoutContext from '../users/LogoutContext';
import {getDisplayName} from '../users/userUtils';
import versionInfo from '../common/VersionInfo';
import {APPLICATION_NAME} from '../constants';
import {COLORS} from '../App.theme';

const styles = theme => ({
    row: {
        display: 'flex',
        justifyContent: 'flex-start'
    },
    button: {
        display: 'flex',
        justifyContent: 'flex-start',
        paddingTop: 0,
        paddingBottom: 0
    },
    avatar: {
        margin: 10,
        width: 28,
        height: 28
    },
    username: {
        color: theme.palette.primary.contrastText,
        fontSize: 12
    },
    logout: {
        width: 50
    },
    logoutIcon: {
        color: theme.palette.primary.contrastText
    },
    menu: {
        paddingTop: 0
    },
    userMenu: {
        backgroundColor: COLORS.fsBlueLightTransp25,
        cursor: 'default'
    },
    customFont: {
        fontFamily: 'sans-serif'
    }
});

const UserMenu = ({menuOpen, classes}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const logout = useContext(LogoutContext);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    if (currentUserLoading) {
        return '...';
    }

    if (currentUserError || !currentUser) {
        return <ErrorOutline style={{fontSize: '2em'}} color="primary.contrastText" />;
    }

    if (!menuOpen) {
        return (
            <IconButton onClick={handleLogout} size="medium" title="Logout" className={classes.logoutIcon}>
                <ExitToApp />
            </IconButton>
        );
    }

    return (
        <div className={classes.row}>
            <Button
                aria-owns={anchorEl ? 'user-menu' : null}
                aria-haspopup="true"
                color="inherit"
                onClick={handleClick}
                className={classes.button}
            >
                <Avatar className={classes.avatar}>
                    {getDisplayName(currentUser) && getDisplayName(currentUser).charAt(0)}
                </Avatar>
                <span className={classes.username}>{getDisplayName(currentUser)}</span>
            </Button>
            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition disablePortal>
                {({TransitionProps, placement}) => (
                    <Grow
                        {...TransitionProps}
                        id="menu-list-grow"
                        style={{
                            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList className={classes.menu}>
                                    <MenuItem className={classes.userMenu} disablefocusonhover="true">
                                        <Card sx={{minWidth: 275}}>
                                            <CardContent>
                                                <Typography sx={{fontSize: 12}} color="text.secondary" gutterBottom>
                                                    Welcome
                                                </Typography>
                                                <Typography variant="h5" component="div">
                                                    {currentUser.username}
                                                </Typography>
                                                <Typography sx={{mb: 1.5}} color="text.secondary">
                                                    {currentUser.email}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {APPLICATION_NAME} version:
                                                    <br />
                                                    {versionInfo.version}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" onClick={handleLogout}>
                                                    Logout
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </div>
    );
};

export default withStyles(styles)(UserMenu);
