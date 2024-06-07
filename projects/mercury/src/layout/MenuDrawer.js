import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Drawer, IconButton} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import styles from './MenuDrawer.styles';
import UserMenu from './UserMenu';

const MenuDrawer = ({open, renderMenu, toggleMenuExpansion, onMouseEnter, onMouseLeave, classes}) => (
    <Drawer
        variant="permanent"
        classes={{
            paper: classNames(classes.drawerPaper, open ? classes.drawerPaperOpen : classes.drawerPaperClose)
        }}
    >
        <div className={classes.mainLogo}>
            {open ? (
                <img src="/public/images/logo_white.png" alt="Fairspace" height="80" />
            ) : (
                <img src="/public/images/icon_white.png" alt="Fairspace" width="40" />
            )}
        </div>
        <div className={classes.menu} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {renderMenu(open)}
        </div>
        <div className={open ? classes.toolbar : classes.toolbarCollapsed}>
            <UserMenu menuOpen={open} />
            <IconButton onClick={toggleMenuExpansion} size="medium" className={classes.toolbarIcon}>
                {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
        </div>
    </Drawer>
);

MenuDrawer.propTypes = {
    open: PropTypes.bool,
    renderMenu: PropTypes.func,
    toggleMenuExpansion: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    classes: PropTypes.object
};

export default withStyles(styles)(MenuDrawer);
