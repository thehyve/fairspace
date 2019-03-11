import React from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";

import {
    ErrorDialog, ErrorMessage,
    CollectionEditor,
    LoadingInlay, LoadingOverlay
} from "../common";
import CollectionList from "./CollectionList";
import * as collectionBrowserActions from "../../actions/collectionBrowserActions";
import * as collectionActions from "../../actions/collectionActions";
import {findById} from "../../utils/arrayUtils";
import {getCollectionAbsolutePath} from '../../utils/collectionUtils';
import Config from "../../services/Config/Config";

class CollectionBrowser extends React.Component {
    state = {
        addingNewCollection: false
    };

    componentDidMount() {
        this.props.fetchCollectionsIfNeeded();
    }

    handleAddCollectionClick = () => {
        this.setState({addingNewCollection: true});
    }

    handleCollectionClick = (collection) => {
        const {selectedCollectionIRI, selectCollection} = this.props;
        if (selectedCollectionIRI !== collection.iri) {
            selectCollection(collection.iri);
        }
    }

    handleCollectionDoubleClick = (collection) => {
        this.props.history.push(getCollectionAbsolutePath(collection));
    }

    handleAddCollection = (name, description, location, type) => {
        this.props.addCollection(name, description, type, location)
            .then(this.props.fetchCollectionsIfNeeded)
            .then(() => this.setState({addingNewCollection: false}))
            .catch(err => {
                const message = err && err.message ? err.message : "An error occurred while creating a collection";
                ErrorDialog.showError(err, message);
            });
    }

    handleCancelAddCollection = () => {
        this.setState({addingNewCollection: false});
    }

    renderCollectionList() {
        const {users, collections, addingCollection, deletingCollection} = this.props;

        collections.forEach(col => {
            col.creatorObj = findById(users, col.createdBy);
        });

        return (
            <>
                <CollectionList
                    collections={this.props.collections}
                    selectedCollectionIRI={this.props.selectedCollectionIRI}
                    onCollectionClick={this.handleCollectionClick}
                    onCollectionDoubleClick={this.handleCollectionDoubleClick}
                />
                {this.state.addingNewCollection ? (
                    <CollectionEditor
                        title="Add collection"
                        onSave={this.handleAddCollection}
                        onClose={this.handleCancelAddCollection}
                        editType={Config.get().enableExperimentalFeatures}
                    />
                ) : null}
                <LoadingOverlay loading={addingCollection || deletingCollection} />
            </>
        );
    }

    render() {
        const {loading, error} = this.props;

        if (error) {
            return <ErrorMessage message="An error occurred while loading collections" />;
        }

        return (
            <>
                {loading ? <LoadingInlay /> : this.renderCollectionList()}
                <Button
                    variant="text"
                    aria-label="Add"
                    title="Create a new collection"
                    onClick={this.handleAddCollectionClick}
                >
                    <Icon>add</Icon>
                </Button>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.account.user.data,
    loading: state.cache.collections.pending || state.account.user.pending || state.cache.users.pending,
    error: state.cache.collections.error || state.account.user.error || state.cache.users.error,
    collections: state.cache.collections.data,
    users: state.cache.users.data,
    selectedCollectionIRI: state.collectionBrowser.selectedCollectionIRI,
    addingCollection: state.collectionBrowser.addingCollection,
    deletingCollection: state.collectionBrowser.deletingCollection
});

const mapDispatchToProps = {
    ...collectionActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CollectionBrowser));
