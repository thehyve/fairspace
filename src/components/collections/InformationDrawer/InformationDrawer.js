import React from 'react';
import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import styles from './InformationDrawer.styles';
import Collection from "./Collection";
import Metadata from "../../metadata/Metadata";
import * as metadataActions from "../../../actions/metadata";
import {connect} from 'react-redux';
import PermissionsContainer from "../../permissions/PermissionsContainer";
import permissionChecker from '../../permissions/PermissionChecker';
import {fetchUsersIfNeeded} from "../../../actions/workspace";
import {findById} from "../../../utils/arrayutils";

export class InformationDrawer extends React.Component {

    componentDidMount() {
        this.props.fetchUsersIfNeeded()
    }

    handleDetailsChange = (collection) => {
        const {fetchCombinedMetadataIfNeeded, invalidateMetadata} = this.props;
        invalidateMetadata(collection.uri);
        fetchCombinedMetadataIfNeeded(collection.uri);
    };

    render() {
        const {classes, collection, collectionAPI} = this.props;

        if (!collection) {
            return <Typography variant="h6">No collection</Typography>;
        }

        return <React.Fragment>
            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography className={classes.heading}>Collection Details</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Collection
                        collection={collection}
                        collectionAPI={collectionAPI}
                        onDidChangeDetails={this.handleDetailsChange}
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography className={classes.heading}>Collaborators:</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <PermissionsContainer
                        collectionId={collection.id}
                        canManage={permissionChecker.canManage(collection)}
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography className={classes.heading}>Metadata</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Metadata
                        subject={collection.uri}
                        editable={permissionChecker.canManage(collection)}
                        style={{width: '100%'}}
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography className={classes.heading}>Path</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    {this.props.path ? this.props.path.map(path => <Typography
                        key={path.filename}>{path.basename}</Typography>) : 'No path selected'}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </React.Fragment>
    };
}

const mapStateToProps = ({cache: {collections}, collectionBrowser: {selectedCollectionId}}) => {
    return {collection: findById(collections.data, selectedCollectionId)}
};

const mapDispatchToProps = {
    ...metadataActions,
    fetchUsersIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(InformationDrawer));


