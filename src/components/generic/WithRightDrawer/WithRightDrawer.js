import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import styles from "./WithRightDrawer.styles";
import Drawer from "@material-ui/core/Drawer/Drawer";
import IconButton from "@material-ui/core/IconButton/IconButton";
import Icon from "@material-ui/core/Icon/Icon";

function WithRightDrawer({classes, drawerOpened, onCloseDrawer, mainContents, drawerContents}) {
    return (
        <div>
            <main className={classNames(
                classes.content, {
                    [classes.contentShift]: drawerOpened
                }
            )}>
                {mainContents}
            </main>
            <Drawer
                variant="persistent"
                anchor="right"
                open={drawerOpened}
                classes={{
                    paper: classes.infoDrawerPaper,
                }}
            >
                <div className={classes.toolbar}/>
                <IconButton onClick={onCloseDrawer} className={classes.closeButton}>
                    <Icon>close</Icon>
                </IconButton>

                <div className={classes.drawerContents}>
                    {drawerContents}
                </div>
            </Drawer>
        </div>
    );
}

WithRightDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    drawerOpened: PropTypes.bool,
    onCloseDrawer: PropTypes.func.isRequired,
    mainContents: PropTypes.node,
    drawerContents: PropTypes.node
}

WithRightDrawer.defaultProps = {
    drawerOpened: false,
    onCloseDrawer: () => {}
}

export default withStyles(styles)(WithRightDrawer);



