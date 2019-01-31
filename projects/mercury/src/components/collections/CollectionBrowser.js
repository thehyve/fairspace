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
import Config from "../../services/Config/Config";

class CollectionBrowser extends React.Component {
    state = {
        addingNewCollection: false
    };

    componentDidMount() {
        this.props.fetchCollectionsIfNeeded();
        this.props.closePath();
    }

    handleAddCollectionClick = () => {
        this.setState({addingNewCollection: true});
    }

    handleCollectionClick = (collection) => {
        const {selectedCollectionId, selectCollection} = this.props;
        if (selectedCollectionId !== collection.id) {
            selectCollection(collection.id);
        }
    }

    handleCollectionDoubleClick = (collection) => {
        this.props.history.push(`/collections/${collection.id}`);
    }

    handleAddCollection = (name, description, type) => {
        this.props.addCollection(name, description, type)
            .then(this.props.fetchCollectionsIfNeeded)
            .then(() => this.setState({addingNewCollection: false}))
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while creating a collection",
                this.handleAddCollectionClick
            ));
    }

    handleCancelAddCollection = () => {
        this.setState({addingNewCollection: false});
    }

    renderCollectionList() {
        const {users, collections, addingCollection, deletingCollection} = this.props;

        collections.forEach(col => {
            col.creatorObj = findById(users, col.creator);
        });

        return (
            <>
                <CollectionList
                    collections={this.props.collections}
                    selectedCollectionId={this.props.selectedCollectionId}
                    onCollectionClick={this.handleCollectionClick}
                    onCollectionDoubleClick={this.handleCollectionDoubleClick}
                />
                {this.state.addingNewCollection ? (
                    <CollectionEditor
                        title="Add collection"
                        name={`${this.props.user.fullName}'s collection`}
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
    selectedCollectionId: state.collectionBrowser.selectedCollectionId,
    addingCollection: state.collectionBrowser.addingCollection,
    deletingCollection: state.collectionBrowser.deletingCollection
});

const mapDispatchToProps = {
    ...collectionActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CollectionBrowser));
