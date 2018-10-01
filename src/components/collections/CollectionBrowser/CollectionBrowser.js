import React from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import Typography from "@material-ui/core/Typography";
import BreadCrumbs from "../../generic/BreadCrumbs/BreadCrumbs";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import {Column, Row} from 'simple-flexbox';
import ErrorDialog from "../../error/ErrorDialog";
import ErrorMessage from "../../error/ErrorMessage";
import {deselectCollection, selectCollection} from "../../../actions/collectionbrowser";
import {addCollection, deleteCollection, fetchCollectionsIfNeeded} from "../../../actions/collections";
import CollectionList from "../CollectionList/CollectionList";

class CollectionBrowser extends React.Component {
    componentDidMount() {
        this.props.dispatch(fetchCollectionsIfNeeded())
        if (this.props.openedCollectionId) {
            this.props.dispatch(selectCollection(this.props.openedCollectionId));
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.openedCollectionId) {
            this.props.dispatch(selectCollection(this.props.openedCollectionId));
        }
    }

    handleAddCollectionClick() {
        const {user} = this.props;
        const name = `${user.fullName}'s collection`;
        const description = "Beyond the horizon";

        this.props.dispatch(addCollection(name, description))
            .then(() => this.props.dispatch(fetchCollectionsIfNeeded()))
            .catch(err =>
                ErrorDialog.showError(
                    err,
                    "An error occurred while creating a collection",
                    this.handleAddCollectionClick.bind(this)
                ))
    }

    handleCollectionClick(collection) {
        // If this collection is already selected, deselect
        if (this.props.selectedCollectionId && this.props.selectedCollectionId === collection.id) {
            this.props.dispatch(deselectCollection())
        } else {
            this.props.dispatch(selectCollection(collection.id))
        }
    }

    handleCollectionDelete(collection) {
        this.props.dispatch(deleteCollection(collection.id))
            .then(() => this.props.dispatch(fetchCollectionsIfNeeded()))
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

    render() {
        const {loading, error} = this.props;

        let mainPanel;
        if (error) {
            return this.renderError(error);
        } else if (loading) {
            mainPanel = this.renderLoading()
        } else {
            mainPanel = this.renderCollectionList();
        }

        // The screen consists of 2 parts:
        // - a list of breadcrumbs and buttons
        // - an overview of items (mainPanel)

        let buttons = this.renderButtons();

        // Markup and title
        return (
            <div>
                <Row>
                    <Column flexGrow={1} vertical='center' horizontal='start'>
                        <div>
                            {this.renderBreadcrumbs()}
                        </div>
                    </Column>
                    <Row>
                        {buttons}
                    </Row>
                </Row>

                {mainPanel}
            </div>
        );
    }

    renderBreadcrumbs() {
        const segments = [{segment: 'collections', label: 'Collections'}]
        return <BreadCrumbs segments={segments}/>;
    }

    renderButtons() {
        return <Button variant="fab" mini color="secondary" aria-label="Add"
                        onClick={this.handleAddCollectionClick.bind(this)}>
                    <Icon>add</Icon>
                </Button>
    }

    renderError(errorMessage) {
        return (<ErrorMessage message={errorMessage} />);
    }

    renderLoading() {
        return (<Typography variant="body2" paragraph={true} noWrap>Loading...</Typography>);
    }

    renderCollectionList() {
        return (
            <CollectionList collections={this.props.collections}
                            selectedCollectionId={this.props.selectedCollectionId}
                            onCollectionClick={this.handleCollectionClick.bind(this)}
                            onCollectionDoubleClick={this.handleCollectionDoubleClick.bind(this)}
                            onCollectionDelete={this.handleCollectionDelete.bind(this)}
            />);
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.account.user.data,
        loading: state.cache.collections.pending,
        error: state.cache.collections.error,
        collections: state.cache.collections.data,

        selectedCollectionId: state.collectionBrowser.selectedCollectionId,
    }
}

export default connect(mapStateToProps)(withRouter(CollectionBrowser));



