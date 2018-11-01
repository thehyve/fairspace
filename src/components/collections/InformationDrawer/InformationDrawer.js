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
import {findById} from "../../../utils/arrayutils";
import PathMetadata from "../../metadata/PathMetadata";

export class InformationDrawer extends React.Component {

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
                    <Typography className={classes.heading}>Collection metadata</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Metadata
                        subject={collection.uri}
                        editable={permissionChecker.canManage(collection) && this.props.paths.length === 0}
                        style={{width: '100%'}}
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            {
                this.props.paths.map(path => (
                    <ExpansionPanel defaultExpanded>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography className={classes.heading}>Metadata for {relativePath(path)}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <PathMetadata
                                path={path}
                                editable={permissionChecker.canManage(collection) && path !== this.props.paths[this.props.paths.length - 1]}
                                style={{width: '100%'}}
                            />
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    ))
            }
        </React.Fragment>
    };


}

const mapStateToProps = ({cache: {collections}, collectionBrowser: {selectedCollectionId, selectedPaths, openedPath}}) => {
    if (openedPath) {
        console.log('Opened', openedPath)
    }
    return {collection: findById(collections.data, selectedCollectionId), openedPath, paths: pathsToDisplay(selectedPaths)}
};

const pathsToDisplay = (selectedPaths) => {
    switch (selectedPaths.length) {
        case 0:
          return [];
        case 1:
            let paths = [];
            let path = '';
            selectedPaths[0].split('/').forEach(p => {
                if (p.length) {
                    path += '/' + p;
                    paths.push(path)
                }
            });
            return paths.slice(1);
        default:
            let first = selectedPaths[0];
            let parent = first.substring(0, first.lastIndexOf('/'));
            return pathsToDisplay([parent])
    }
}

const relativePath = (path)  => path.split('/').slice(2).join('/');

const mapDispatchToProps = {
    ...metadataActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(InformationDrawer));


