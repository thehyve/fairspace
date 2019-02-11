import React from 'react';
import {connect} from 'react-redux';
import {Grid, AppBar, Tabs, Tab} from '@material-ui/core';
import {withRouter} from 'react-router-dom';
import queryString from 'query-string';

import CollectionList from '../collections/CollectionList';
import FileList from '../file/FileList';
import * as collectionBrowserActions from '../../actions/collectionBrowserActions';
import * as collectionActions from '../../actions/collectionActions';
import * as fileActions from '../../actions/fileActions';

class SearchPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTabIndex: this.getTabIndexFromQuery(),
            filteredCollections: [],
            filteredFiles: []
        };
    }

    componentDidMount() {
        const {
            fetchCollectionsIfNeeded, selectCollection, fetchFilesIfNeeded, openedCollection, openedPath
        } = this.props;
        fetchCollectionsIfNeeded();
        selectCollection(openedCollection.id);

        // If the collection has not been fetched yet,
        // do not bother fetching the files
        if (openedCollection.id) {
            fetchFilesIfNeeded(openedCollection, openedPath);
        }

        this.updateSearchResults();
    }

    componentDidUpdate(prevProps) {
        const {
            selectCollection, fetchFilesIfNeeded, openedCollection, openedPath, openPath
        } = this.props;

        if (prevProps.openedCollection.id !== openedCollection.id) {
            selectCollection(openedCollection.id);
        }

        const hasCollectionDetails = openedCollection.id;
        const hasNewOpenedCollection = prevProps.openedCollection.id !== openedCollection.id;
        const hasNewOpenedPath = prevProps.openedPath !== openedPath;

        if (hasCollectionDetails && (hasNewOpenedCollection || hasNewOpenedPath)) {
            fetchFilesIfNeeded(openedCollection, openedPath);
            openPath(`/${openedCollection.location}${openedPath === '/' ? '' : openedPath}`);
        }

        if (this.props.search !== prevProps.search) {
            this.updateSearchResults();
        }
    }

    updateSearchResults = () => {
        const selectedTabIndex = this.getTabIndexFromQuery();
        this.setState({selectedTabIndex});
    }

    getTabIndexFromQuery = () => (queryString.parse(this.props.location.search).type === 'collections' ? 0 : 1);

    handleTabChange = (e, selectedTabIndex) => {
        this.setState({selectedTabIndex});
        const type = selectedTabIndex === 0 ? 'collections' : 'files';
        const {q} = queryString.parse(this.props.location.search);
        this.props.history.push(`/search?type=${type}&q=${q}`);
    };

    render() {
        const {filteredCollections, filteredFiles, selectedTabIndex} = this.state;

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <AppBar square elevation={2} position="static" color="default">
                        <Tabs
                            value={selectedTabIndex}
                            onChange={this.handleTabChange}
                            centered
                        >
                            <Tab label="Collections" />
                            <Tab label="Files" />
                        </Tabs>
                    </AppBar>
                </Grid>
                <Grid item xs={12}>
                    {selectedTabIndex === 0 && (
                        <CollectionList
                            collections={filteredCollections}
                            onCollectionClick={() => {}}
                            onCollectionDoubleClick={() => {}}
                        />
                    )}
                    {selectedTabIndex === 1 && (
                        <FileList
                            files={filteredFiles}
                            selectedPaths={[]}
                            onPathClick={() => {}}
                            onPathDoubleClick={() => {}}
                            onRename={() => {}}
                            onDelete={() => {}}
                        // readonly
                        />
                    )}
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const {match: {params}} = ownProps;
    const openedCollectionId = 500;
    const openedPath = params.path ? `/${params.path}` : '/';
    const filesPerCollection = state.cache.filesByCollectionAndPath[openedCollectionId] || [];
    const files = filesPerCollection[openedPath] || [];
    const getCollection = collectionId => (state.cache.collections.data && state.cache.collections.data.find(collection => collection.id === collectionId)) || {};

    return {
        user: state.account.user.data,
        loading: state.cache.collections.pending || state.account.user.pending || state.cache.users.pending,
        error: state.cache.collections.error || state.account.user.error || state.cache.users.error,
        collections: state.cache.collections.data,
        users: state.cache.users.data,
        selectedCollectionId: state.collectionBrowser.selectedCollectionId,
        addingCollection: state.collectionBrowser.addingCollection,
        deletingCollection: state.collectionBrowser.deletingCollection,
        // loading: files.pending || state.cache.collections.pending || state.cache.collections.data.length === 0,
        // error: files.error || state.cache.collections.error,
        files: files.data,
        selectedPaths: state.collectionBrowser.selectedPaths,
        openedCollection: openedCollectionId ? getCollection(openedCollectionId) : {},
        openedCollectionId,
        openedPath
    };
};

const mapDispatchToProps = {
    ...collectionActions,
    ...collectionBrowserActions,
    ...fileActions,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchPage));
