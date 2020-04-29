import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Divider, Drawer, IconButton} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import styles from "./MenuDrawer.styles";

const MenuDrawer = ({open, renderMenu, toggleMenuExpansion, onMouseEnter, onMouseLeave, classes}) => (
    <Drawer
        variant="permanent"
        classes={{
            paper: classNames(classes.drawerPaper, open ? classes.drawerPaperOpen : classes.drawerPaperClose),
        }}
    >
        <div className={classes.toolbar}>
            <IconButton onClick={toggleMenuExpansion}>
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
