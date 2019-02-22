import React from 'react';
import {
    ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails,
    Paper, withStyles, Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {connect} from 'react-redux';

import styles from './InformationDrawer.styles';
import CollectionDetails from "./CollectionDetails";
import Metadata from "../metadata/Metadata";
import PathMetadata from "../metadata/PathMetadata";
import * as metadataActions from "../../actions/metadataActions";
import * as collectionActions from '../../actions/collectionActions';
import {canManage} from '../../utils/permissionUtils';
import ErrorDialog from './ErrorDialog';

export class InformationDrawer extends React.Component {
    handleDetailsChange = (collection) => {
        const {fetchCombinedMetadataIfNeeded, invalidateMetadata} = this.props;
        invalidateMetadata(collection.iri);
        fetchCombinedMetadataIfNeeded(collection.iri);
    };

    handleCollectionDelete = (collection) => {
        const {deleteCollection, fetchCollectionsIfNeeded} = this.props;
        deleteCollection(collection.iri)
            .then(fetchCollectionsIfNeeded)
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a collection",
                this.handleCollectionDelete
            ));
    }

    handleUpdateCollection = (name, description, location) => {
        // TODO: validation should be part of the child component
        if ((name !== this.props.collection.name || description !== this.props.collection.description || location !== this.props.collection.location)
            && (name !== '') && (location !== '')) {
            this.props.updateCollection(this.props.collection.iri, name, description, location)
                .then(() => {
                    // TODO: no need to clone object, just use the id in the handleDetailsChange
                    const collection = Object.assign(this.props.collection, {name, description});
                    this.handleDetailsChange(collection);
                })
                .catch(e => ErrorDialog.showError(e, "An error occurred while updating collection metadata"));
        }
    }

    render() {
        const {classes, collection, loading} = this.props;

        if (!collection) {
            return <Typography variant="h6">Please select a collection..</Typography>;
        }

        const isMetaDataEditable = canManage(collection) && this.props.paths.length === 0;
        const relativePath = path => path.split('/').slice(2).join('/');

        return (
            <>
                <CollectionDetails
                    collection={collection}
                    onUpdateCollection={this.handleUpdateCollection}
                    onCollectionDelete={this.handleCollectionDelete}
                    loading={loading}
                />
                <Paper style={{padding: 20, marginTop: 10}}>
                    <Metadata
                        subject={collection.iri}
                        editable={isMetaDataEditable}
                        style={{width: '100%'}}
                    />
                </Paper>
                {
                    this.props.paths.map(path => (
                        <ExpansionPanel
                            key={path}
                            defaultExpanded
                        >
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <Typography
                                    className={classes.heading}
                                >
                                    {'Metadata for '}
                                    {relativePath(path)}
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <PathMetadata
                                    collection={collection}
                                    path={path}
                                    editable={canManage(collection) && path === this.props.paths[this.props.paths.length - 1]}
                                    style={{width: '100%'}}
                                />
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    ))
                }
            </>
        );
    }
}

function pathHierarchy(fullPath) {
    const paths = [];
    let path = fullPath;
    while (path && path.lastIndexOf('/') > 0) {
        paths.push(path.substring(path.indexOf('/', 1)));
        path = path.substring(0, path.lastIndexOf('/'));
    }
    return paths.reverse();
}

const mapStateToProps = ({cache: {collections, users}, collectionBrowser: {selectedCollectionIRI, openedPath, selectedPaths}}) => ({
    collection: collections.data && collections.data.find(c => c.iri === selectedCollectionIRI),
    paths: pathHierarchy((selectedPaths.length === 1) ? selectedPaths[0] : openedPath),
    loading: users.pending
});

const mapDispatchToProps = {
    ...metadataActions,
    ...collectionActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(InformationDrawer));
