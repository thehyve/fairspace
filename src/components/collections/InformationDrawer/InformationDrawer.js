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
import {fetchMetadataBySubjectIfNeeded, invalidateMetadata} from "../../../actions/metadata";
import {connect} from 'react-redux';

function InformationDrawer(props) {
    function handleDetailsChange(collection) {
        props.onDidChangeDetails(collection);
        props.dispatch(invalidateMetadata(collection.uri));
        props.dispatch(fetchMetadataBySubjectIfNeeded(collection.uri));
    }

    function renderCollectionDetails() {
        if(!props.collection) {
            return <Typography variant="title">No collection</Typography>;
        }

        const { classes, collection } = props;

        return <React.Fragment>
            <div className={classes.root}>
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
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
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>Shared with</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Permissions collectionId={collection.id} creator={collection.creator}/>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>Metadata</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Metadata
                            subject={collection.uri}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
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

export default connect()(withStyles(styles)(InformationDrawer));


