import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Divider, Drawer, IconButton} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import styles from './MenuDrawer.styles';

const MenuDrawer = ({open, renderMenu, toggleMenuExpansion, onMouseEnter, onMouseLeave, classes}) => (
    <Drawer
        variant="permanent"
        classes={{
            paper: classNames(classes.drawerPaper, open ? classes.drawerPaperOpen : classes.drawerPaperClose)
        }}
    >
        <div className={classes.toolbar}>
            <IconButton onClick={toggleMenuExpansion} size="medium">
                {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
        </div>
        <Divider />
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {renderMenu()}
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
