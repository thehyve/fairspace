import React, {useContext, useEffect, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {withRouter} from "react-router-dom";
import queryString from "query-string";

import FileBrowser from "./FileBrowser";
import CollectionInformationDrawer from '../collections/CollectionInformationDrawer';
import {getPathInfoFromParams, splitPathIntoArray} from "./fileUtils";
import * as consts from '../constants';
import CollectionBreadcrumbsContextProvider from "../collections/CollectionBreadcrumbsContextProvider";
import CollectionsContext from "../collections/CollectionsContext";
import {useMultipleSelection} from "./UseSelection";
import LoadingOverlay from "../common/components/LoadingOverlay";
import {handleCollectionSearchRedirect} from "../collections/collectionUtils";
import SearchBar from "../search/SearchBar";
import BreadCrumbs from "../common/components/BreadCrumbs";
import usePageTitleUpdater from "../common/hooks/UsePageTitleUpdater"

export const FilesPage = ({
    match,
    location,
    history,
    fileApi,
    collections = [],
    loading = false,
    error = false
}) => {
    const {params} = match;
    const {collectionLocation, openedPath} = getPathInfoFromParams(params);
    const collection = collections.find(c => c.location === collectionLocation) || {};
    const selection = useMultipleSelection();
    const [busy, setBusy] = useState(false);

    // TODO: this code could be buggy, if the url had an invalid file name it will still be part of the selection.
    // I suggest that the selection state be part of a context (FilesContext ?)..
    //
    // Check whether a filename is specified in the url for selection
    // If so, select it on first render
    const preselectedFile = location.search ? decodeURIComponent(queryString.parse(location.search).selection) : undefined;

    const handleSearch = (value) => {
        handleCollectionSearchRedirect(history, value);
    };

    useEffect(() => {
        if (preselectedFile) {
            selection.select(preselectedFile);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedFile]);
    // Determine breadcrumbs. If a collection is opened, show the full path
    // Otherwise, show a temporary breadcrumb
    const pathSegments = splitPathIntoArray(openedPath);
    const breadcrumbSegments = collection.name
        ? pathSegments.map((segment, idx) => ({
            label: idx === 0 ? collection.name : segment,
            href: consts.PATH_SEPARATOR + consts.COLLECTIONS_PATH + consts.PATH_SEPARATOR + pathSegments.slice(0, idx + 1).join(consts.PATH_SEPARATOR)
        }))
        : [{label: '...', href: consts.PATH_SEPARATOR + consts.COLLECTIONS_PATH + openedPath}];

    usePageTitleUpdater(`${breadcrumbSegments.map(s => s.label).join(' / ')} / Collections`);

    // Path for which metadata should be rendered
    const path = (selection.selected.length === 1) ? selection.selected[0] : openedPath;

    return (
        <CollectionBreadcrumbsContextProvider>
            <div style={{position: 'relative', zIndex: 1}}>
                <BreadCrumbs additionalSegments={breadcrumbSegments} />
            </div>
            <div style={{marginBottom: 16, width: consts.MAIN_CONTENT_WIDTH}}>
                <SearchBar
                    placeholder="Search"
                    disableUnderline={false}
                    onSearchChange={handleSearch}
                />
            </div>
            <Grid container spacing={1}>
                <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                    <FileBrowser
                        data-testid="file-browser"
                        openedCollection={collection}
                        openedPath={openedPath}
                        collectionsLoading={loading}
                        collectionsError={error}
                        fileApi={fileApi}
                        selection={selection}
                    />
                </Grid>
                <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                    <CollectionInformationDrawer
                        setBusy={setBusy}
                        path={path}
                        selectedCollectionIri={collection.iri}
                    />
                </Grid>
            </Grid>
            <LoadingOverlay loading={busy} />
        </CollectionBreadcrumbsContextProvider>
    );
};

const ContextualFilesPage = (props) => {
    const {collections, loading, error} = useContext(CollectionsContext);
    return (
        <FilesPage
            collections={collections}
            loading={loading}
            error={error}
            {...props}
        />
    );
};

export default withRouter(ContextualFilesPage);
