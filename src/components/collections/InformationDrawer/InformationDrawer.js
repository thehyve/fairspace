import React from 'react';
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';
import styles from './InformationDrawer.styles';
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Collection from "./Collection";

function InformationDrawer(props) {
    let contents;

    if(props.collection) {
        contents = (<Collection collection={props.collection} onChangeDetails={props.onChangeDetails}/>)
    } else {
        contents = (<Typography variant="title">No collection</Typography>);
    }

    return (
        <Drawer
            variant="persistent"
            anchor="right"
            open={props.open}
            classes={{
                paper: props.classes.infoDrawerPaper,
            }}
        >
            <div className={props.classes.toolbar}/>
            <IconButton onClick={props.onClose} className={props.classes.closeButton}>
                <Icon>chevron_right</Icon>
            </IconButton>

            {contents}

        </Drawer>
    );
}

export default withStyles(styles)(InformationDrawer);


