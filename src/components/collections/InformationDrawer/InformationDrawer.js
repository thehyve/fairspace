import React from 'react';
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';
import styles from './InformationDrawer.styles';
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Collection from "./Collection";
import Metadata from "../../metadata/Metadata";
import Permissions from '../../permissions/Permissions'
import {fetchMetadataBySubjectIfNeeded, invalidateMetadata} from "../../../actions/metadata";
import {connect} from 'react-redux';

function InformationDrawer(props) {
    function handleDetailsChange(collection) {
        props.onDidChangeDetails(collection);
        props.dispatch(invalidateMetadata(this.props.collection.uri));
        props.dispatch(fetchMetadataBySubjectIfNeeded(this.props.collection.uri));
    }

    function renderCollectionDetails() {
        if(!props.collection) {
            return <Typography variant="title">No collection</Typography>;
        }

        return <React.Fragment>
                <Collection
                    collection={props.collection}
                    collectionAPI={props.collectionAPI}
                    onDidChangeDetails={handleDetailsChange}
                />
                <hr/>

                <Permissions collectionId={props.collection.id}/>
                <hr/>

                <Metadata subject={props.collection.uri} />

                <hr/>

                <Typography variant="title">Paths</Typography>
                {props.path ? props.path.map(path => <Typography
                    key={path.filename}>{path.basename}</Typography>) : 'No path selected'}
            </React.Fragment>
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

            {renderCollectionDetails()}

        </Drawer>
    );
}

export default connect()(withStyles(styles)(InformationDrawer));


