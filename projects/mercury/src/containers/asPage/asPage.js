import React from "react";
import MenuDrawer from "../../components/layout/MenuDrawer/MenuDrawer";
import styles from './Page.styles'
import {withStyles} from "@material-ui/core";

const asPage = WrappedComponent => {
    const RenderAsPage = props => {
        const {classes, ...otherProps} = props;

        return (<React.Fragment>
            <MenuDrawer/>
            <main className={classes.content}>
                <div className={classes.toolbar}/>

                <WrappedComponent {...otherProps} />
            </main>
        </React.Fragment>);
    }

    return withStyles(styles)(RenderAsPage);
}

export default asPage;
