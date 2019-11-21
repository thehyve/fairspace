import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {
    ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid, Typography, withStyles
} from '@material-ui/core';
import AssignmentOutlined from '@material-ui/icons/AssignmentOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withRouter} from "react-router-dom";
import {ErrorDialog, MessageDisplay, UsersContext} from '@fairspace/shared-frontend';

import styles from './InformationDrawer.styles';
import CollectionDetails from "../../collections/CollectionDetails";
import PathMetadata from "../../metadata/metadata/PathMetadata";
import getDisplayName from "../utils/userUtils";
import CollectionsContext from "../contexts/CollectionsContext";
import {LinkedDataEntityFormWithLinkedData} from '../../metadata/common/LinkedDataEntityFormContainer';

const getUserObject = (users, iri) => users.find(user => user.iri === iri);

const pathHierarchy = (fullPath) => {
    if (!fullPath) return [];

    const paths = [];
    let path = fullPath;
    while (path && path.lastIndexOf('/') > 0) {
        paths.push(path);
        path = path.substring(0, path.lastIndexOf('/'));
    }
    return paths.reverse();
};

export class InformationDrawer extends React.Component {
    handleDetailsChange = (location, locationChanged) => {
        // If the location of a collection has changed, the URI where it
        // can be found may also change. For that reason we need to redirect
        // the user there.
        if (locationChanged && this.props.onCollectionLocationChange) {
            this.props.onCollectionLocationChange(location);
        }
    };

    handleCollectionDelete = (collection) => {
        const {deleteCollection, setBusy = () => {}} = this.props;
        setBusy(true);
        deleteCollection(collection.iri, collection.location)
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a collection",
                this.handleCollectionDelete
            ))
            .finally(() => setBusy(false));
    };

    handleUpdateCollection = (name, description, location, connectionString) => {
        const {collection: oldCollection, setBusy = () => {}} = this.props;
        setBusy(true);

        if ((name !== oldCollection.name
            || description !== oldCollection.description
            || location !== oldCollection.location
            || connectionString !== oldCollection.connectionString)
            && (name !== '') && (location !== '')) {
            return this.props.updateCollection(oldCollection.iri, name, description, connectionString, location, oldCollection.location)
                .then(() => {
                    const locationChanged = oldCollection.location !== location;
                    this.handleDetailsChange(location, locationChanged);
                })
                .catch(err => {
                    const message = err && err.message ? err.message : "An error occurred while creating a collection";
                    ErrorDialog.showError(err, message, () => {}, false);
                })
                .finally(() => setBusy(false));
        }

        return Promise.resolve();
    };

    render() {
        const {classes, collection, loading, atLeastSingleCollectionExists, inCollectionsBrowser = false, path} = this.props;
        const {users} = this.context;

        const paths = pathHierarchy(path);

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

        const isMetaDataEditable = collection && collection.canManage && paths.length === 0;
        const relativePath = fullPath => fullPath.split('/').slice(2).join('/');

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
                        <LinkedDataEntityFormWithLinkedData
                            subject={collection.iri}
                            isEntityEditable={isMetaDataEditable}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                {
                    paths.map(metadataPath => (
                        <ExpansionPanel
                            key={metadataPath}
                            defaultExpanded
                        >
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <Typography
                                    className={classes.heading}
                                >
                                    Metadata for {relativePath(metadataPath)}
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <PathMetadata
                                    path={metadataPath}
                                    isEntityEditable={collection.canManage && metadataPath === paths[paths.length - 1]}
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

InformationDrawer.contextType = UsersContext;

InformationDrawer.propTypes = {
    updateCollection: PropTypes.func,
    deleteCollection: PropTypes.func,
    onCollectionLocationChange: PropTypes.func,

    collection: PropTypes.object,
    loading: PropTypes.bool
};

const ContextualInformationDrawer = ({selectedCollectionIri, ...props}) => {
    const {loading, collections, updateCollection, deleteCollection} = useContext(CollectionsContext);
    const collection = collections.find(c => c.iri === selectedCollectionIri);
    const atLeastSingleCollectionExists = collections.length > 0;

    return (
        <InformationDrawer
            {...props}
            loading={loading}
            collection={collection}
            updateCollection={updateCollection}
            deleteCollection={deleteCollection}
            atLeastSingleCollectionExists={atLeastSingleCollectionExists}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualInformationDrawer));
