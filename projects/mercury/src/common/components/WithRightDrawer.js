import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {withStyles} from '@mui/styles';
import Drawer from '@mui/material/Drawer/Drawer';
import IconButton from '@mui/material/IconButton';
import {Close} from '@mui/icons-material';
import styles from './WithRightDrawer.styles';

function WithRightDrawer({
    classes,
    mainContents,
    drawerContents,
    collapsible,
    drawerOpened,
    onCloseDrawer
}) {
    return (
        <div>
            <main
                className={classNames(classes.content, {
                    [classes.contentShift]: drawerOpened
                })}
            >
                <div>{mainContents}</div>
            </main>
            <Drawer
                variant="persistent"
                anchor="right"
                open={drawerOpened || !collapsible}
                classes={{
                    paper: classes.infoDrawerPaper
                }}
            >
                {collapsible ? (
                    <div>
                        <div className={classes.toolbar} />
                        <IconButton
                            onClick={onCloseDrawer}
                            title="Close drawer"
                            className={classes.closeButton}
                        >
                            <Close />
                        </IconButton>
                    </div>
                ) : null}

                <div className={classes.drawerContents}>{drawerContents}</div>
            </Drawer>
        </div>
    );
}

WithRightDrawer.propTypes = {
    drawerOpened: PropTypes.bool,
    collapsible: PropTypes.bool,
    onCloseDrawer: PropTypes.func,
    mainContents: PropTypes.node.isRequired,
    drawerContents: PropTypes.node.isRequired
};

WithRightDrawer.defaultProps = {
    collapsible: true,
    drawerOpened: true,
    onCloseDrawer: () => {}
};

export default withStyles(styles)(WithRightDrawer);
