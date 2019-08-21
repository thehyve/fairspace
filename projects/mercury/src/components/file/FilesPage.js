import React, {useEffect} from 'react';
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

export const FilesPage = (props) => {
    const {
        openedCollection, fetchCollectionsIfNeeded, fetchFilesIfNeeded, openedPath, files, loading, error, selectedPaths, selectPath,
        deselectPath, renameFile, selectPaths, deselectAllPaths,
        history
    } = props;

    // Fetch collections on mount
    useEffect(() => {
        fetchCollectionsIfNeeded();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch files if the path has changed
    useEffect(() => {
        fetchFilesIfNeeded(openedPath);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openedPath, openedCollection.connectionString]);

    // Determine breadcrumbs. If a collection is opened, show the full path
    // Otherwise, show a temporary breadcrumb
    const pathSegments = splitPathIntoArray(openedPath);
    const breadcrumbSegments = (openedCollection && openedCollection.name)
        ? pathSegments.map((segment, idx) => ({
            label: idx === 0 ? openedCollection.name : segment,
            href: consts.COLLECTIONS_PATH + consts.PATH_SEPARATOR + pathSegments.slice(0, idx + 1).join(consts.PATH_SEPARATOR)
        }))
        : [{label: '...', href: consts.COLLECTIONS_PATH + openedPath}];

    const handleCollectionLocationChange = (location) => {
        // If the collection location changes, the URI for the current page should change as well
        history.push(`${getCollectionAbsolutePath(location)}${getDirectoryFromFullpath(openedPath)}`);
    };

    return (
        <CollectionBreadcrumbsContextProvider>
            <div style={{position: 'relative', zIndex: 1}}>
                <BreadCrumbs additionalSegments={breadcrumbSegments} />
            </div>
            <Grid container spacing={8}>
                <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                    <FileBrowser
                        fetchFilesIfNeeded={fetchFilesIfNeeded}
                        openedCollection={openedCollection}
                        openedPath={openedPath}
                        files={files}
                        loading={loading}
                        error={error}
                        selectPath={selectPath}
                        selectedPaths={selectedPaths}
                        deselectPath={deselectPath}
                        renameFile={renameFile}
                        onSelectAll={() => selectPaths(files.map(f => f.filename))}
                        onDeselectAll={deselectAllPaths}
                    />
                </Grid>
                <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                    <InformationDrawer onCollectionLocationChange={handleCollectionLocationChange} />
                </Grid>
            </Grid>
        </CollectionBreadcrumbsContextProvider>
    );
};

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
