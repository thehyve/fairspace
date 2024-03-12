import React from 'react';
import { withRouter } from 'react-router-dom';
import { AppBar, Toolbar } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

import UserMenu from './UserMenu';

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1,
    },
    title: {
        flexGrow: 1,
        marginLeft: 20,
        width: 150,
    },
});

const TopBar = ({ classes, children }) => (
    <AppBar className={classes.root} position="sticky">
        <Toolbar>
            <div className={classes.title}>
                <img src="/public/images/logo_white.png" alt="Fairspace" height="60" />
            </div>
            {children}
            <UserMenu />
        </Toolbar>
    </AppBar>
);

export default withRouter(withStyles(styles)(TopBar));
