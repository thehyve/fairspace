import React from 'react';
import Grid from '@material-ui/core/Grid';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';

import FileBrowser from "./FileBrowser";
import InformationDrawer from '../common/InformationDrawer';
import {getDirectoryFromFullpath, getPathInfoFromParams, splitPathIntoArray} from "../../utils/fileUtils";
import * as collectionBrowserActions from "../../actions/collectionBrowserActions";
import * as fileActions from "../../actions/fileActions";
import * as collectionActions from "../../actions/collectionActions";
import * as consts from '../../constants';
import {getCollectionAbsolutePath} from "../../utils/collectionUtils";
import BreadCrumbs from "../common/breadcrumbs/BreadCrumbs";
import CollectionBreadcrumbsContextProvider from "../collections/CollectionBreadcrumbsContextProvider";

export class FilesPage extends React.Component {
    componentDidMount() {
        const {fetchCollectionsIfNeeded, fetchFilesIfNeeded, openedPath} = this.props;
        fetchCollectionsIfNeeded();
        fetchFilesIfNeeded(openedPath);
    }

    componentDidUpdate(prevProps) {
        const {fetchFilesIfNeeded, openedPath} = this.props;
        if (prevProps.openedPath !== openedPath) {
            fetchFilesIfNeeded(openedPath);
        }
    }

    renderBreadcrumbs() {
        const {openedCollection, openedPath} = this.props;

        if (!openedCollection || !openedCollection.name) {
            return (
                <BreadCrumbs additionalSegments={[
                    {label: '...', href: consts.COLLECTIONS_PATH + openedPath}
                ]}
                />
            );
        }

        const pathSegments = splitPathIntoArray(openedPath);
        const segments = pathSegments.map((segment, idx) => ({
            label: segment,
            href: consts.COLLECTIONS_PATH + consts.PATH_SEPARATOR + pathSegments.slice(0, idx + 1).join(consts.PATH_SEPARATOR)
        }));
        segments[0].label = openedCollection.name;

        return (
            <div style={{position: 'relative', zIndex: 1}}>
                <BreadCrumbs additionalSegments={segments} />
            </div>
        );
    }

    handleCollectionLocationChange = (collection) => {
        const {openedPath} = this.props;

        // If the collection location changes, the URI for the current page should change as well
        this.props.history.push(`${getCollectionAbsolutePath(collection.location)}${getDirectoryFromFullpath(openedPath)}`);
    }

    render() {
        const {
            openedCollection, fetchFilesIfNeeded, openedPath, files, loading, selectedPaths, selectPath,
            deselectPath, renameFile, deleteFile, selectPaths, deselectAllPaths,
        } = this.props;

        return (
            <CollectionBreadcrumbsContextProvider>
                {this.renderBreadcrumbs()}
                <Grid container spacing={8}>
                    <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                        <FileBrowser
                            fetchFilesIfNeeded={fetchFilesIfNeeded}
                            openedCollection={openedCollection}
                            openedPath={openedPath}
                            files={files}
                            loading={loading}
                            selectPath={selectPath}
                            selectedPaths={selectedPaths}
                            deselectPath={deselectPath}
                            renameFile={renameFile}
                            deleteFile={deleteFile}
                            onSelectAll={() => selectPaths(files.map(f => f.filename))}
                            onDeselectAll={deselectAllPaths}
                        />
                    </Grid>
                    <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                        <InformationDrawer onCollectionLocationChange={this.handleCollectionLocationChange} />
                    </Grid>
                </Grid>
            </CollectionBreadcrumbsContextProvider>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const {match: {params}} = ownProps;
    const {collectionLocation, openedPath} = getPathInfoFromParams(params);
    const collection = (state.cache.collections.data && state.cache.collections.data.find(c => c.location === collectionLocation)) || {};
    const files = state.cache.filesByPath[openedPath] || [];

    return {
        loading: files.pending || state.cache.collections.pending,
        error: files.error || state.cache.collections.error,
        files: files.data,
        selectedPaths: state.collectionBrowser.selectedPaths,
        openedCollection: collection,
        openedPath
    };
};

const mapDispatchToProps = {
    ...collectionActions,
    ...fileActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FilesPage));
