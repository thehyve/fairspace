import React from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import BreadCrumbs from "../../generic/BreadCrumbs/BreadCrumbs";
import ErrorDialog from "../../error/ErrorDialog";
import ErrorMessage from "../../error/ErrorMessage";
import CollectionList from "../CollectionList/CollectionList";
import * as collectionBrowserActions from "../../../actions/collectionbrowser";
import * as collectionActions from "../../../actions/collections";
import GenericCollectionsScreen from "../GenericCollectionsScreen/GenericCollectionsScreen";
import CollectionEditor from "../CollectionList/CollectionEditor";
import {findById} from "../../../utils/arrayutils";

class CollectionBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {addingCollection: false}
    }

    componentDidMount() {
        this.props.fetchCollectionsIfNeeded()
    }

    handleAddCollectionClick() {
        this.setState({addingCollection: true})
    }

    handleCollectionClick(collection) {
        const {selectedCollectionId, selectCollection, deselectCollection} = this.props;
        // If this collection is already selected, deselect
        if (selectedCollectionId && selectedCollectionId === collection.id) {
            deselectCollection()
        } else {
            selectCollection(collection.id)
        }
    }

    handleCollectionDelete(collection) {
        const {deleteCollection, fetchCollectionsIfNeeded} = this.props;
        deleteCollection(collection.id)
            .then(fetchCollectionsIfNeeded)
            .catch(err =>
                ErrorDialog.showError(
                    err,
                    "An error occurred while deleting a collection",
                    this.handleCollectionDelete.bind(this)
                ))
    }

    handleCollectionDoubleClick(collection) {
        this.props.history.push("/collections/" + collection.id);
    }

    renderButtons() {
        return <Button variant="fab" mini color="secondary" aria-label="Add"
                       onClick={this.handleAddCollectionClick.bind(this)}>
            <Icon>add</Icon>
        </Button>
    }

    renderLoading() {
        return (<Typography variant="body1" paragraph={true} noWrap>Loading...</Typography>);
    }

    renderCollectionList() {
        const {users, collections} = this.props;
        collections.map(col => col.creatorObj = findById(users, col.creator));
        return (
            <div>
                <CollectionList collections={this.props.collections}
                                selectedCollectionId={this.props.selectedCollectionId}
                                onCollectionClick={this.handleCollectionClick.bind(this)}
                                onCollectionDoubleClick={this.handleCollectionDoubleClick.bind(this)}
                                onCollectionDelete={this.handleCollectionDelete.bind(this)}
                />
                <CollectionEditor
                    title={'Add collection'}
                    name={this.props.user.fullName + '\'s collection'}
                    editing={this.state.addingCollection}
                    onSave={this.handleAddCollection.bind(this)}
                    onCancel={this.handleCancelAddCollection.bind(this)}
                    editType={true}
                />
            </div>
        );

    }

    handleAddCollection(name, description, type) {
        this.setState({addingCollection: false});

        this.props.addCollection(name, description, type)
            .then(this.props.fetchCollectionsIfNeeded)
            .catch(err =>
                ErrorDialog.showError(
                    err,
                    "An error occurred while creating a collection",
                    this.handleAddCollectionClick.bind(this)
                ))
    }

    handleCancelAddCollection() {
        this.setState({addingCollection: false});
    }

    render() {
        const {loading, error} = this.props;

        if (error) {
            return <ErrorMessage message={"An error occurred while loading collections"}/>
        }

        return <GenericCollectionsScreen
            breadCrumbs={<BreadCrumbs/>}
            buttons={this.renderButtons()}
            main={loading ? this.renderLoading() : this.renderCollectionList()}/>
    }

}

const mapStateToProps = (state, ownProps) => ({
    user: state.account.user.data,
    loading: state.cache.collections.pending || state.account.user.pending || state.cache.users.pending,
    error: state.cache.collections.error || state.account.user.error || state.cache.users.error,
    collections: state.cache.collections.data,
    users: state.cache.users.data,
    selectedCollectionId: state.collectionBrowser.selectedCollectionId,
});

const mapDispatchToProps = {
    ...collectionActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CollectionBrowser));
