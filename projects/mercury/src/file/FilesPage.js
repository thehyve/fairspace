import React, {useEffect} from 'react';
import Grid from '@material-ui/core/Grid';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import {BreadCrumbs, usePageTitleUpdater} from "@fairspace/shared-frontend";

import FileBrowser from "./FileBrowser";
import InformationDrawer from '../common/components/InformationDrawer';
import {getDirectoryFromFullpath, getPathInfoFromParams, splitPathIntoArray} from "../common/utils/fileUtils";
import * as collectionBrowserActions from "../common/redux/actions/collectionBrowserActions";
import * as collectionActions from "../common/redux/actions/collectionActions";
import * as consts from '../constants';
import {getCollectionAbsolutePath} from "../common/utils/collectionUtils";
import CollectionBreadcrumbsContextProvider from "../collections/CollectionBreadcrumbsContextProvider";
import {useFiles} from "./UseFiles";

export const FilesPage = ({
    openedCollection, fetchCollectionsIfNeeded,
    openedPath, selectedPaths, selectPath,
    deselectPath, selectPaths, deselectAllPaths,
    history
}) => {
    const {files, loading, error, refresh, fileActions} = useFiles(openedPath);

    // Determine breadcrumbs. If a collection is opened, show the full path
    // Otherwise, show a temporary breadcrumb
    const pathSegments = splitPathIntoArray(openedPath);
    const breadcrumbSegments = (openedCollection && openedCollection.name)
        ? pathSegments.map((segment, idx) => ({
            label: idx === 0 ? openedCollection.name : segment,
            href: consts.COLLECTIONS_PATH + consts.PATH_SEPARATOR + pathSegments.slice(0, idx + 1).join(consts.PATH_SEPARATOR)
        }))
        : [{label: '...', href: consts.COLLECTIONS_PATH + openedPath}];

    usePageTitleUpdater(`${breadcrumbSegments.map(s => s.label).join(' / ')} / Collections`);

    // Fetch collections on mount
    useEffect(() => {
        fetchCollectionsIfNeeded();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                        refreshFiles={refresh}
                        openedCollection={openedCollection}
                        openedPath={openedPath}
                        files={files}
                        loading={loading}
                        error={error}
                        selectPath={selectPath}
                        selectedPaths={selectedPaths}
                        deselectPath={deselectPath}
                        fileActions={fileActions}
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

    return {
        selectedPaths: state.collectionBrowser.selectedPaths,
        openedCollection: collection,
        openedPath
    };
};

const mapDispatchToProps = {
    ...collectionActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FilesPage));
