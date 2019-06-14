import React, {useContext, useState} from 'react';
import {
    Button, MenuItem, Avatar, Grow,
    Paper, Popper, ClickAwayListener, MenuList
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import UserContext from '../../../../UserContext';

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
    const {currentUser, onLogout} = useContext(UserContext);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        onLogout();
    };

    return currentUser && (
        <>
            <Button
                aria-owns={anchorEl ? 'user-menu' : null}
                aria-haspopup="true"
                color="inherit"
                onClick={handleClick}
                className={classes.row}
            >
                <Avatar alt={currentUser.fullName} src="/images/avatar.png" className={classes.avatar} />
                <span>
                    {currentUser.fullName}
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
