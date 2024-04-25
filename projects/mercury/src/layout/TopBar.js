import React from 'react';
import {withRouter} from 'react-router-dom';
import {AppBar, Toolbar} from '@mui/material';

import withStyles from '@mui/styles/withStyles';

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1,
        borderBottom: '3px solid ' + theme.palette.primary.dark
    },
    title: {
        flexGrow: 1,
        marginLeft: 20,
        width: 150
    }
});

const TopBar = ({classes, children}) => (
    <AppBar className={classes.root} position="sticky">
        <Toolbar>
            <div className={classes.title}>
                <img src="/images/icon_white.png" alt="Fairspace" height="60" />
            </div>
            {children}
        </Toolbar>
    </AppBar>
);

export default withRouter(withStyles(styles)(TopBar));
