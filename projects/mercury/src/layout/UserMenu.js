import React, {useContext, useState} from 'react';
import {
    Avatar,
    Button,
    Card,
    CardActions,
    CardContent,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Typography
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';

import {ErrorOutline} from '@mui/icons-material';
import UserContext from '../users/UserContext';
import LogoutContext from '../users/LogoutContext';
import {getDisplayName} from '../users/userUtils';
import versionInfo from '../common/VersionInfo';
import {APPLICATION_NAME} from '../constants';

const styles = {
    row: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 0,
        paddingBottom: 0
    },
    avatar: {
        margin: 10,
        width: 28,
        height: 28
    },
    logout: {
        width: 50
    },
    menu: {
        paddingTop: 0
    },
    userMenu: {
        backgroundColor: 'lightgrey',
        cursor: 'default'
    },
    customFont: {
        fontFamily: 'sans-serif'
    }
};

const UserMenu = ({classes}) => {
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
        return <ErrorOutline style={{fontSize: '2em'}} color="inherit" />;
    }

    return (
        <>
            <Button
                aria-owns={anchorEl ? 'user-menu' : null}
                aria-haspopup="true"
                color="inherit"
                onClick={handleClick}
                className={classes.row}
            >
                <Avatar alt={currentUser.name} src="/public/images/avatar.png" className={classes.avatar} />
                <span>{getDisplayName(currentUser)}</span>
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
        </>
    );
};

export default withStyles(styles)(UserMenu);
