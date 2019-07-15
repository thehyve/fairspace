import React from 'react';
import PropTypes from 'prop-types';
import {
    ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid, Paper, Typography, withStyles
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';

import styles from './InformationDrawer.styles';
import CollectionDetails from "./CollectionDetails";
import LinkedDataEntityFormContainer from "../metadata/common/LinkedDataEntityFormContainer";
import PathMetadata from "../metadata/metadata/PathMetadata";
import * as metadataActions from "../../actions/metadataActions";
import * as collectionActions from '../../actions/collectionActions';
import ErrorDialog from './ErrorDialog';
import {getPathInfoFromParams} from "../../utils/fileUtils";
import TechnicalPathMetadata from "../metadata/metadata/TechnicalPathMetadata";
import {findById} from "../../utils/genericUtils";
import {getLocalPart} from "../../utils/linkeddata/metadataUtils";
import UsersContext from "../permissions/UsersContext";
import getDisplayName from "../../utils/userUtils";

const getUserObject = (users, iri) => findById(users, getLocalPart(iri));

export class InformationDrawer extends React.Component {
    handleDetailsChange = (collection, locationChanged) => {
        const {fetchMetadata, invalidateMetadata} = this.props;
        invalidateMetadata(collection.iri);
        fetchMetadata(collection.iri);

        // If the location of a collection has changed, the URI where it
        // can be found may also change. For that reason we need to redirect
        // the user there.
        if (locationChanged && this.props.onCollectionLocationChange) {
            this.props.onCollectionLocationChange(collection);
        }
    };

    handleCollectionDelete = (collection) => {
        const {deleteCollection, fetchCollectionsIfNeeded} = this.props;
        deleteCollection(collection.iri, collection.location)
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
            return this.props.updateCollection(this.props.collection.iri, name, description, location)
                .then(() => {
                    // TODO: no need to clone object, just use the id in the handleDetailsChange
                    const locationChanged = this.props.collection.location !== location;
                    const collection = Object.assign(this.props.collection, {name, description, location});
                    this.handleDetailsChange(collection, locationChanged);
                })
                .catch(err => {
                    const message = err && err.message ? err.message : "An error occurred while creating a collection";
                    ErrorDialog.showError(err, message);
                });
        }

        return Promise.resolve();
    };

    render() {
        const {classes, collection, loading} = this.props;
        const {users} = this.context;

        if (!collection) {
            return <Typography variant="h6">Please select a collection..</Typography>;
        }

        const isMetaDataEditable = collection && collection.canManage && this.props.paths.length === 0;
        const relativePath = path => path.split('/').slice(2).join('/');

        return (
            <>
                <CollectionDetails
                    collection={collection}
                    onUpdateCollection={this.handleUpdateCollection}
                    onCollectionDelete={this.handleCollectionDelete}
                    loading={loading}
                    collectionProps={{
                        dateCreated: collection.dateCreated,
                        createdBy: collection.createdBy ? getDisplayName(getUserObject(users, collection.createdBy)) : '',
                        dateModified: collection.dateModified,
                        modifiedBy: collection.modifiedBy ? getDisplayName(getUserObject(users, collection.modifiedBy)) : '',
                    }}
                />
                <Paper style={{padding: 20, marginTop: 10}}>
                    <LinkedDataEntityFormContainer
                        subject={collection.iri}
                        isEditable={isMetaDataEditable}
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
                                <Grid container>
                                    <Grid item xs={12}>
                                        <TechnicalPathMetadata path={path} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <PathMetadata
                                            path={path}
                                            isEditable={collection.canManage && path === this.props.paths[this.props.paths.length - 1]}
                                            style={{width: '100%'}}
                                        />
                                    </Grid>
                                </Grid>
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
        paths.push(path);
        path = path.substring(0, path.lastIndexOf('/'));
    }
    return paths.reverse();
}

InformationDrawer.contextType = UsersContext;

InformationDrawer.propTypes = {
    fetchMetadata: PropTypes.func,
    invalidateMetadata: PropTypes.func,
    updateCollection: PropTypes.func,
    deleteCollection: PropTypes.func,
    fetchCollectionsIfNeeded: PropTypes.func,
    onCollectionLocationChange: PropTypes.func,

    collection: PropTypes.object,
    loading: PropTypes.bool
};

const mapStateToProps = ({cache: {collections},
    collectionBrowser: {selectedPaths, selectedCollectionLocation}}, ownProps) => {
    const {match: {params}} = ownProps;
    const {collectionLocation, openedPath} = getPathInfoFromParams(params);
    const location = collectionLocation || selectedCollectionLocation;
    const collection = (collections.data && collections.data.find(c => c.location === location));

    return {
        collection,
        paths: pathHierarchy((selectedPaths.length === 1) ? selectedPaths[0] : openedPath),
        loading: collections.pending
    };
};

const mapDispatchToProps = {
    fetchMetadata: metadataActions.fetchMetadataBySubjectIfNeeded,
    invalidateMetadata: metadataActions.invalidateMetadata,

    updateCollection: collectionActions.updateCollection,
    deleteCollection: collectionActions.deleteCollection,
    fetchCollectionsIfNeeded: collectionActions.fetchCollectionsIfNeeded
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(InformationDrawer)));
