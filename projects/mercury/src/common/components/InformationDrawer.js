import React from 'react';
import PropTypes from 'prop-types';
import {
    ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary,
    Typography, withStyles, Grid
} from '@material-ui/core';
import {AssignmentOutlined} from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';

import styles from './InformationDrawer.styles';
import CollectionDetails from "./CollectionDetails";
import LinkedDataEntityFormContainer from "../../metadata/common/LinkedDataEntityFormContainer";
import PathMetadata from "../../metadata/metadata/PathMetadata";
import * as metadataActions from "../redux/actions/metadataActions";
import * as collectionActions from '../redux/actions/collectionActions';
import ErrorDialog from './ErrorDialog';
import {getPathInfoFromParams} from "../utils/fileUtils";
import UsersContext from "../contexts/UsersContext";
import getDisplayName from "../utils/userUtils";
import MessageDisplay from './MessageDisplay';

const getUserObject = (users, iri) => users.find(user => user.iri === iri);

export class InformationDrawer extends React.Component {
    handleDetailsChange = ({iri, location}, locationChanged) => {
        this.props.fetchMetadata(iri);

        // If the location of a collection has changed, the URI where it
        // can be found may also change. For that reason we need to redirect
        // the user there.
        if (locationChanged && this.props.onCollectionLocationChange) {
            this.props.onCollectionLocationChange(location);
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
        const oldCollection = this.props.collection;

        if ((name !== this.props.collection.name
            || description !== this.props.collection.description
            || location !== oldCollection.location)
            && (name !== '') && (location !== '')) {
            return this.props.updateCollection(this.props.collection.iri, name, description, location, oldCollection.location)
                .then(this.props.fetchCollectionsIfNeeded)
                .then(() => {
                    const locationChanged = oldCollection.location !== location;
                    this.handleDetailsChange({iri: oldCollection.iri, location}, locationChanged);
                })
                .catch(err => {
                    const message = err && err.message ? err.message : "An error occurred while creating a collection";
                    ErrorDialog.showError(err, message, () => {}, false);
                });
        }

        return Promise.resolve();
    };

    render() {
        const {classes, collection, loading, atLeastSingleCollectionExists, inCollectionsBrowser = false} = this.props;
        const {users} = this.context;

        const getUsernameByIri = iri => getDisplayName(getUserObject(users, iri));

        if (!collection) {
            return atLeastSingleCollectionExists && inCollectionsBrowser
                && (
                    <Grid container direction="column" justify="center" alignItems="center">
                        <Grid item>
                            <AssignmentOutlined color="disabled" style={{fontSize: '4em'}} />
                        </Grid>
                        <Grid item>
                            <MessageDisplay
                                message="Select a collection to display its metadata"
                                variant="h6"
                                withIcon={false}
                                isError={false}
                                messageColor="textSecondary"
                            />
                        </Grid>
                    </Grid>
                );
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
                        createdBy: collection.createdBy ? getUsernameByIri(collection.createdBy) : '',
                        dateModified: collection.dateModified,
                        modifiedBy: collection.modifiedBy ? getUsernameByIri(collection.modifiedBy) : '',
                    }}
                />
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Metadata for {collection.name}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <LinkedDataEntityFormContainer
                            subject={collection.iri}
                            isEntityEditable={isMetaDataEditable}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
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
                                    Metadata for {relativePath(path)}
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <PathMetadata
                                    path={path}
                                    isEntityEditable={collection.canManage && path === this.props.paths[this.props.paths.length - 1]}
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
        paths.push(path);
        path = path.substring(0, path.lastIndexOf('/'));
    }
    return paths.reverse();
}

InformationDrawer.contextType = UsersContext;

InformationDrawer.propTypes = {
    fetchMetadata: PropTypes.func,
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
    const atLeastSingleCollectionExists = !!(collections.data && collections.data.length > 0);

    return {
        collection,
        paths: pathHierarchy((selectedPaths.length === 1) ? selectedPaths[0] : openedPath),
        loading: collections.pending,
        atLeastSingleCollectionExists
    };
};

const mapDispatchToProps = {
    fetchMetadata: metadataActions.fetchMetadataBySubjectIfNeeded,

    updateCollection: collectionActions.updateCollection,
    deleteCollection: collectionActions.deleteCollection,
    fetchCollectionsIfNeeded: collectionActions.fetchCollectionsIfNeeded
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(InformationDrawer)));
