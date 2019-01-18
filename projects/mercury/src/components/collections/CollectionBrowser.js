import React from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import Fab from "@material-ui/core/Fab";
import Icon from "@material-ui/core/Icon";
import BreadCrumbs from "../common/BreadCrumbs";
import ErrorDialog from "../common/ErrorDialog";
import ErrorMessage from "../common/ErrorMessage";
import CollectionList from "./CollectionList";
import * as collectionBrowserActions from "../../actions/collectionbrowser";
import * as collectionActions from "../../actions/collections";
import GenericCollectionsScreen from "../common/GenericCollectionsScreen";
import {findById} from "../../utils/arrayutils";
import CollectionEditor from "../common/CollectionEditor";
import LoadingInlay from '../common/LoadingInlay';
import LoadingOverlay from '../common/LoadingOverlay';
import Config from "../../services/Config/Config";

class CollectionBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addingNewCollection: false
        };
    }

    componentDidMount() {
        this.props.fetchCollectionsIfNeeded();
        this.props.closePath();
    }

    handleAddCollectionClick = () => {
        this.setState({addingNewCollection: true});
    }

    handleCollectionClick = (collection) => {
        const {selectedCollectionId, selectCollection, deselectCollection} = this.props;
        // If this collection is already selected, deselect
        if (selectedCollectionId && selectedCollectionId === collection.id) {
            deselectCollection();
        } else {
            selectCollection(collection.id);
        }
    }

    handleCollectionDelete = (collection) => {
        const {deleteCollection, fetchCollectionsIfNeeded} = this.props;
        deleteCollection(collection.id)
            .then(fetchCollectionsIfNeeded)
            .catch(err => ErrorDialog.showError(
                err,
                "An error occurred while deleting a collection",
                this.handleCollectionDelete
            ));
    }

    handleCollectionDoubleClick = (collection) => {
        this.props.history.push(`/collections/${collection.id}`);
    }

    renderButtons = () => (
        <Fab
            mini="true"
            color="secondary"
            aria-label="Add"
            title="Add collection"
            onClick={this.handleAddCollectionClick}
        >
            <Icon>add</Icon>
        </Fab>
    );

    handleAddCollection = (name, description, type) => {
        this.props.addCollection(name, description, type)
            .then(this.props.fetchCollectionsIfNeeded)
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
        const {
            users, collections, addingCollection, deletingCollection
        } = this.props;
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
                    onCollectionDelete={this.handleCollectionDelete}
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
            <GenericCollectionsScreen
                breadCrumbs={<BreadCrumbs />}
                buttons={this.renderButtons()}
                main={loading ? <LoadingInlay /> : this.renderCollectionList()}
            />
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
