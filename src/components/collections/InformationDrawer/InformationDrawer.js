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
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

class InformationDrawer extends React.Component {
    state = {
        refreshRequired: false
    };

    handleDetailsChange(collection) {
        this.props.onDidChangeDetails(collection);
        this.setState({refreshRequired: true});
    }

    handleMetadataDidLoad() {
        this.setState({refreshRequired: false});
    }

    renderCollectionDetails() {
        if (!this.props.collection) {
            return <Typography variant="title">No collection</Typography>;
        }
        const { classes, collection } = this.props;
        return (
            <React.Fragment>
                <div className={classes.root}>
                    <ExpansionPanel defaultExpanded>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className={classes.heading}>Collection Details</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <Collection
                                collection={this.props.collection}
                                collectionAPI={this.props.collectionAPI}
                                onDidChangeDetails={this.handleDetailsChange.bind(this)}
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
                                refresh={this.state.refreshRequired}
                                onDidLoad={this.handleMetadataDidLoad.bind(this)}
                                subject={this.props.collection.uri}
                                metadataAPI={this.props.metadataAPI}
                            />
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel defaultExpanded>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className={classes.heading}>Path</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {this.props.path ? this.props.path.map(path => <Typography
                                key={path.filename}>{path.basename}</Typography>) : 'No path selected'}
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </div>
            </React.Fragment>
        );
    }

    render() {
        return (
            <Drawer
                variant="persistent"
                anchor="right"
                open={this.props.open}
                classes={{
                    paper: this.props.classes.infoDrawerPaper,
                }}
            >
                <div className={this.props.classes.toolbar}/>
                <IconButton onClick={this.props.onClose} className={this.props.classes.closeButton}>
                    <Icon>close</Icon>
                </IconButton>

                {this.renderCollectionDetails()}

            </Drawer>
        );
    }
}

export default withStyles(styles)(InformationDrawer);


