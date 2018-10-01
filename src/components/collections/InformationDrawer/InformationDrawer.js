import React from 'react';
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import styles from './InformationDrawer.styles';
import Collection from "./Collection";
import Metadata from "../../metadata/Metadata";
import Permissions from '../../permissions/Permissions'
import * as metadataActions from "../../../actions/metadata";
import {connect} from 'react-redux';

function InformationDrawer(props) {
    function handleDetailsChange(collection) {
        const {fetchCombinedMetadataIfNeeded, invalidateMetadata} = props;

        invalidateMetadata(collection.uri);
        fetchCombinedMetadataIfNeeded(collection.uri);
    }

    function renderCollectionDetails() {
        if (!props.collection) {
            return <Typography variant="title">No collection</Typography>;
        }

        const {classes, collection} = props;

        return <React.Fragment>
            <div className={classes.root}>
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography className={classes.heading}>Collection Details</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Collection
                            collection={collection}
                            collectionAPI={props.collectionAPI}
                            onDidChangeDetails={handleDetailsChange}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography className={classes.heading}>Shared with</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Permissions collection={collection}/>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography className={classes.heading}>Metadata</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Metadata
                            subject={collection.uri}
                            collection={collection}
                            style={{width: '100%'}}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography className={classes.heading}>Path</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        {props.path ? props.path.map(path => <Typography
                            key={path.filename}>{path.basename}</Typography>) : 'No path selected'}
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
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
                <Icon>close</Icon>
            </IconButton>

            {renderCollectionDetails()}

        </Drawer>
    );
}

const mapStateToProps = (state) => {
    const collections = state.cache.collections;
    const collectionBrowser = state.collectionBrowser;

    const getCollection = (collectionId) => {
        if (!collections.data || collections.data.length === 0) {
            return {}
        }

        return collections.data.find(collection => collection.id === collectionId) || {}
    }

    return {
        collection: getCollection(collectionBrowser.selectedCollectionId)
    }
}

const mapDispatchToProps = {
    ...metadataActions
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(InformationDrawer));


