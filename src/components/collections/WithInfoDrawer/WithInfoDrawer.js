import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import styles from "./WithInfoDrawer.styles";
import {closeInfoDrawer} from "../../../actions/collectionbrowser";

function WithInfoDrawer({dispatch, classes, infoDrawerOpened, children}) {
    const handleCloseInfoDrawer = () => {
        dispatch(closeInfoDrawer())
    }

    return (
        <div>
            <main className={classNames(
                classes.content, {
                    [classes.contentShift]: infoDrawerOpened
                }
            )}>
                {children}
            </main>
            <InformationDrawer
                open={infoDrawerOpened}
                onClose={handleCloseInfoDrawer}
            >
            </InformationDrawer>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        infoDrawerOpened: state.collectionBrowser.infoDrawerOpened
    }
}

export default connect(mapStateToProps)(withStyles(styles)(WithInfoDrawer));



