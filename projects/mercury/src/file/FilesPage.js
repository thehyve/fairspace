import React, {useContext, useEffect, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {Link, withRouter} from "react-router-dom";
import queryString from "query-string";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import {Switch, withStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {Search} from "@material-ui/icons";
import FileBrowser from "./FileBrowser";
import CollectionInformationDrawer from '../collections/CollectionInformationDrawer';
import {getPathInfoFromParams, splitPathIntoArray} from "./fileUtils";
import * as consts from '../constants';
import CollectionBreadcrumbsContextProvider from "../collections/CollectionBreadcrumbsContextProvider";
import CollectionsContext from "../collections/CollectionsContext";
import {useMultipleSelection} from "./UseSelection";
import LoadingOverlay from "../common/components/LoadingOverlay";
import {handleCollectionTextSearchRedirect} from "../collections/collectionUtils";
import SearchBar from "../search/SearchBar";
import BreadCrumbs from "../common/components/BreadCrumbs";
import usePageTitleUpdater from "../common/hooks/UsePageTitleUpdater";
import styles from "./FilesPage.styles";
import useAsync from "../common/hooks/UseAsync";
import FileAPI from "./FileAPI";
import {getMetadataViewsPath, resourcesView} from "../metadata/views/metadataViewUtils";
import MetadataViewContext from "../metadata/views/MetadataViewContext";
import UserContext from "../users/UserContext";

export const FilesPage = ({
    location,
    history,
    fileApi,
    collection,
    openedPath,
    views,
    loading = false,
    error = false,
    showDeleted,
    setShowDeleted,
    isOpenedPathDeleted = false,
    currentUser,
    classes
}) => {
    const selection = useMultipleSelection();
    const [busy, setBusy] = useState(false);

    // TODO: this code could be buggy, if the url had an invalid file name it will still be part of the selection.
    // I suggest that the selection state be part of a context (FilesContext ?)..
    //
    // Check whether a filename is specified in the url for selection
    // If so, select it on first render
    const preselectedFile = location.search ? decodeURIComponent(queryString.parse(location.search).selection) : undefined;

    const getLocationContext = () => {
        const collectionIri: string = collection.iri || '';
        const collectionRoot = collectionIri.substring(0, collectionIri.lastIndexOf('/'));
        return encodeURI(collectionRoot + openedPath);
    };

    const getAdvancedSearchRedirect = () => (
        `${getMetadataViewsPath()}?${queryString.stringify({view: resourcesView(views).name, context: getLocationContext()})}`
    );

    const handleTextSearch = (value) => {
        handleCollectionTextSearchRedirect(history, value, getLocationContext());
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
            href: consts.PATH_SEPARATOR + consts.COLLECTIONS_PATH + consts.PATH_SEPARATOR + pathSegments.slice(0, idx + 1).map(encodeURIComponent).join(consts.PATH_SEPARATOR)
        }))
        : [{label: '...', href: consts.PATH_SEPARATOR + consts.COLLECTIONS_PATH + encodeURI(openedPath)}];

    usePageTitleUpdater(`${breadcrumbSegments.map(s => s.label).join(' / ')} / Collections`);

    // Path for which metadata should be rendered
    const path = (selection.selected.length === 1) ? selection.selected[0] : openedPath;

    return (
        <CollectionBreadcrumbsContextProvider>
            <div className={classes.breadcrumbs}>
                <BreadCrumbs additionalSegments={breadcrumbSegments} />
            </div>
            <Grid container justify="space-between" spacing={1}>
                <Grid item className={classes.topBar}>
                    <Grid container>
                        <Grid item xs={6}>
                            <SearchBar
                                placeholder="Search"
                                disableUnderline={false}
                                onSearchChange={handleTextSearch}
                            />
                        </Grid>
                        <Grid item xs={3} className={classes.advancedSearchButton}>
                            {currentUser.canViewPublicMetadata && views && resourcesView(views) && (
                                <Link to={getAdvancedSearchRedirect()}>
                                    <Button
                                        variant="text"
                                        color="primary"
                                        startIcon={<Search />}
                                    >
                                        Advanced search
                                    </Button>
                                </Link>
                            )}
                        </Grid>
                        <Grid item xs={3} className={classes.topBarSwitch}>
                            <FormControlLabel
                                control={(
                                    <Switch
                                        color="primary"
                                        checked={showDeleted}
                                        onChange={() => setShowDeleted(!showDeleted)}
                                        disabled={isOpenedPathDeleted}
                                    />
                                )}
                                label="Show deleted"
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid item className={classes.centralPanel}>
                    <FileBrowser
                        data-testid="file-browser"
                        openedCollection={collection}
                        openedPath={openedPath}
                        isOpenedPathDeleted={isOpenedPathDeleted}
                        collectionsLoading={loading}
                        collectionsError={error}
                        fileApi={fileApi}
                        selection={selection}
                        showDeleted={showDeleted}
                    />
                </Grid>
                <Grid item className={classes.sidePanel}>
                    <CollectionInformationDrawer
                        setBusy={setBusy}
                        path={path}
                        selectedCollectionIri={collection.iri}
                        showDeleted={showDeleted}
                    />
                </Grid>
            </Grid>
            <LoadingOverlay loading={busy} />
        </CollectionBreadcrumbsContextProvider>
    );
};

const ParentAwareFilesPage = (props) => {
    const {data, error, loading, refresh} = useAsync(
        () => (FileAPI.stat(props.openedPath, true)),
        [props.openedPath]
    );

    useEffect(() => {refresh();}, [props.collection.dateDeleted, refresh]);

    const isParentFolderDeleted = data && data.props && !!data.props.dateDeleted;
    const isOpenedPathDeleted = !!props.collection.dateDeleted || isParentFolderDeleted;

    return (
        <FilesPage
            isOpenedPathDeleted={isOpenedPathDeleted}
            loading={loading && props.loading}
            error={error && props.error}
            {...props}
        />
    );
};

const ContextualFilesPage = (props) => {
    const {collections, loading, error, showDeleted, setShowDeleted} = useContext(CollectionsContext);
    const {views} = useContext(MetadataViewContext);
    const {currentUser} = useContext(UserContext);
    const {params} = props.match;
    const {collectionName, openedPath} = getPathInfoFromParams(params);
    const collection = collections.find(c => c.name === collectionName) || {};

    return showDeleted ? (
        <ParentAwareFilesPage
            collection={collection}
            openedPath={openedPath}
            loading={loading}
            error={error}
            showDeleted={showDeleted}
            setShowDeleted={setShowDeleted}
            views={views}
            currentUser={currentUser}
            {...props}
        />
    ) : (
        <FilesPage
            collection={collection}
            openedPath={openedPath}
            loading={loading}
            error={error}
            showDeleted={showDeleted}
            setShowDeleted={setShowDeleted}
            views={views}
            currentUser={currentUser}
            {...props}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualFilesPage));
