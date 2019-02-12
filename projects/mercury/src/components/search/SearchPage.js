import React from 'react';
import {connect} from 'react-redux';
import {Grid, AppBar, Tabs, Tab} from '@material-ui/core';
import {withRouter} from 'react-router-dom';

import CollectionList from '../collections/CollectionList';
import FileList from '../file/FileList';
import * as collectionBrowserActions from '../../actions/collectionBrowserActions';
import * as collectionActions from '../../actions/collectionActions';
import * as fileActions from '../../actions/fileActions';
import {buildSearchUrl, getSearchQueryFromString, getSearchTypeFromString} from '../../utils/searchUtils';

// TODO: a lot of the code here is for UX/UI demoing
class SearchPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTabIndex: this.getTabIndexFromQuery(props.location.search),
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
            selectCollection, fetchFilesIfNeeded, openedCollection,
            openedPath, openPath, location: {search}, collections, files
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

        if (files.length !== prevProps.files.length
            || collections.length !== prevProps.collections.length
            || search !== prevProps.location.search) {
            this.updateSearchResults();
        }
    }

    updateSearchResults = () => {
        const {location: {search}, collections, files} = this.props;
        const selectedTabIndex = this.getTabIndexFromQuery(search);
        const query = getSearchQueryFromString(search).toLowerCase();

        if (selectedTabIndex === 0) {
            const filteredCollections = collections.filter(c => c.name.toLowerCase().includes(query));
            this.setState({
                selectedTabIndex,
                filteredCollections
            });
        } else {
            const filteredFiles = files.filter(f => f.basename.toLowerCase().includes(query));
            this.setState({
                selectedTabIndex,
                filteredFiles
            });
        }
    }

    getTabIndexFromQuery = (query) => (getSearchTypeFromString(query) === 'files' ? 1 : 0);

    handleTabChange = (e, selectedTabIndex) => {
        this.setState({selectedTabIndex});
        const type = selectedTabIndex === 0 ? 'collections' : 'files';
        const query = getSearchQueryFromString(this.props.location.search);
        const searchUrl = buildSearchUrl(type, query);
        this.props.history.push(searchUrl);
    };

    handleCollectionOpen = (collection) => {
        this.props.history.push(`/collections/${collection.id}`);
    }

    handlePathDoubleClick = (path) => {
        if (path.type === 'directory') {
            this.openDir(path.basename);
        } else {
            // console.log(path);
        }
    }

    openDir(path) {
        const basePath = this.props.openedPath || '';
        const separator = basePath.endsWith('/') ? '' : '/';
        const fullPath = `/collections/${this.props.openedCollection.id}${basePath}${separator}${path}`;
        this.props.history.push(fullPath);
        this.props.openPath(`/${this.props.openedCollection.location}${basePath}${separator}${path}`);
    }

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
                            onCollectionDoubleClick={this.handleCollectionOpen}
                        />
                    )}
                    {selectedTabIndex === 1 && (
                        <FileList
                            files={filteredFiles}
                            selectedPaths={[]}
                            onPathClick={() => {}}
                            onPathDoubleClick={this.handlePathDoubleClick}
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
        collections: state.cache.collections.data || [],
        users: state.cache.users.data,
        selectedCollectionId: state.collectionBrowser.selectedCollectionId,
        addingCollection: state.collectionBrowser.addingCollection,
        deletingCollection: state.collectionBrowser.deletingCollection,
        files: files.data || [],
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
