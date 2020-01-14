import React, {useContext, useState} from 'react';
import {Avatar, Button, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import UserContext from "../../contexts/UserContext";
import MessageDisplay from "../MessageDisplay";
import LogoutContext from "../../contexts/LogoutContext";

const styles = {
    row: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 0,
        paddingBottom: 0
    },
    avatar: {
        margin: 10,
    }
};

const UserMenu = ({classes}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const logout = useContext(LogoutContext);

    const handleClick = (event) => {
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

    if (currentUserError) {
        return <MessageDisplay message=" " small noMessage />;
    }

    return currentUser && (
        <>
            <Button
                aria-owns={anchorEl ? 'user-menu' : null}
                aria-haspopup="true"
                color="inherit"
                onClick={handleClick}
                className={classes.row}
            >
                <Avatar alt={currentUser.name} src="/public/images/avatar.png" className={classes.avatar} />
                <span>
                    {currentUser.name}
                </span>
            </Button>
            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition disablePortal>
                {({TransitionProps, placement}) => (
                    <Grow
                        {...TransitionProps}
                        id="menu-list-grow"
                        style={{transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList>
                                    <MenuItem onClick={handleClose} disabled>Profile</MenuItem>
                                    <MenuItem onClick={handleClose} disabled>My account</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
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
