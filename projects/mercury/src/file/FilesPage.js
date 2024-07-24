import React, {useContext, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import {withRouter} from 'react-router-dom';
import queryString from 'query-string';

import FormControlLabel from '@mui/material/FormControlLabel';
import {Divider, Switch} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import FileBrowser from './FileBrowser';
import CollectionInformationDrawer from '../collections/CollectionInformationDrawer';
import {getPathInfoFromParams, splitPathIntoArray} from './fileUtils';
import * as consts from '../constants';
import CollectionBreadcrumbsContextProvider from '../collections/CollectionBreadcrumbsContextProvider';
import CollectionsContext from '../collections/CollectionsContext';
import {useMultipleSelection} from './UseSelection';
import LoadingOverlay from '../common/components/LoadingOverlay';
import SearchBar from '../search/SearchBar';
import BreadCrumbs from '../common/components/BreadCrumbs';
import usePageTitleUpdater from '../common/hooks/UsePageTitleUpdater';
import styles from './FilesPage.styles';
import useAsync from '../common/hooks/UseAsync';
import {LocalFileAPI} from './FileAPI';
import {getMetadataViewsPath, RESOURCES_VIEW} from '../metadata/views/metadataViewUtils';
import UserContext from '../users/UserContext';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import type {Collection} from '../collections/CollectionAPI';
import type {User} from '../users/UsersAPI';
import {MetadataViewOptions} from '../metadata/views/MetadataViewAPI';
import type {Match} from '../types';
import {handleTextSearchRedirect} from '../search/searchUtils';

type ContextualFilesPageProperties = {
    match: Match,
    history: History,
    location: Location,
    classes: any
};

type ParentAwareFilesPageProperties = ContextualFilesPageProperties & {
    collection: Collection,
    currentUser: User,
    openedPath: string,
    views: MetadataViewOptions[],
    loading: boolean,
    error: Error,
    showDeleted: boolean,
    setShowDeleted: boolean => void
};

type FilesPageProperties = ParentAwareFilesPageProperties & {
    isOpenedPathDeleted: boolean
};

export const FilesPage = (props: FilesPageProperties) => {
    const {
        loading = false,
        isOpenedPathDeleted = false,
        showDeleted = false,
        setShowDeleted = () => {},
        openedPath = '',
        views = [],
        currentUser,
        error,
        location,
        history,
        collection,
        classes
    } = props;

    const selection = useMultipleSelection();
    const [busy, setBusy] = useState(false);

    // TODO: this code could be buggy, if the url had an invalid file name it will still be part of the selection.
    // I suggest that the selection state be part of a context (FilesContext ?)..
    //
    // Check whether a filename is specified in the url for selection
    // If so, select it on first render
    const preselectedFile = location.search
        ? decodeURIComponent(queryString.parse(location.search).selection)
        : undefined;

    const getLocationContext = () => {
        const collectionIri: string = collection.iri || '';
        const collectionRoot = collectionIri.substring(0, collectionIri.lastIndexOf('/'));
        return encodeURI(collectionRoot + openedPath);
    };

    const getMetadataSearchRedirect = () =>
        `${getMetadataViewsPath()}?${queryString.stringify({view: RESOURCES_VIEW, context: getLocationContext()})}`;

    const handleTextSearch = value => {
        handleTextSearchRedirect(history, value, getLocationContext());
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
              href:
                  consts.PATH_SEPARATOR +
                  consts.COLLECTIONS_PATH +
                  consts.PATH_SEPARATOR +
                  pathSegments
                      .slice(0, idx + 1)
                      .map(encodeURIComponent)
                      .join(consts.PATH_SEPARATOR)
          }))
        : [
              {
                  label: '...',
                  href: consts.PATH_SEPARATOR + consts.COLLECTIONS_PATH + encodeURI(openedPath)
              }
          ];

    usePageTitleUpdater(`${breadcrumbSegments.map(s => s.label).join(' / ')} / Collections`);

    // Path for which metadata should be rendered
    const path = selection.selected.length === 1 ? selection.selected[0] : openedPath;

    const showMetadataSearchButton: boolean =
        currentUser &&
        currentUser.canViewPublicMetadata &&
        views &&
        views.some(v => v.name === RESOURCES_VIEW) &&
        !isOpenedPathDeleted &&
        collection.iri;

    return (
        <CollectionBreadcrumbsContextProvider>
            <div className={classes.breadcrumbs}>
                <BreadCrumbs additionalSegments={breadcrumbSegments} />
            </div>
            <Grid container justifyContent="space-between" spacing={1}>
                <Grid item className={classes.topBar}>
                    <Grid container>
                        <Grid item xs={6}>
                            <SearchBar
                                placeholder={`Search in ${openedPath.substring(openedPath.lastIndexOf('/') + 1)}`}
                                onSearchChange={handleTextSearch}
                            />
                        </Grid>
                        {showMetadataSearchButton && (
                            <Grid item container xs={4} justifyContent="flex-end">
                                <Grid item className={classes.metadataButton}>
                                    <Button
                                        variant="text"
                                        color="primary"
                                        href={getMetadataSearchRedirect(RESOURCES_VIEW)}
                                    >
                                        Collection metadata search
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Divider orientation="vertical" />
                                </Grid>
                            </Grid>
                        )}
                        <Grid item xs={2} className={classes.topBarSwitch}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        color="primary"
                                        checked={showDeleted}
                                        onChange={() => setShowDeleted(!showDeleted)}
                                        disabled={isOpenedPathDeleted}
                                    />
                                }
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
                        loading={loading}
                        error={error}
                        selection={selection}
                        preselectedFile={preselectedFile}
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

const ParentAwareFilesPage = (props: ParentAwareFilesPageProperties) => {
    const {data, error, loading, refresh} = useAsync(
        () => LocalFileAPI.stat(props.openedPath, true),
        [props.openedPath]
    );

    useEffect(() => {
        refresh();
    }, [props.collection.dateDeleted, refresh]);

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

const ContextualFilesPage = (props: ContextualFilesPageProperties) => {
    const {collections, loading, error, showDeleted, setShowDeleted} = useContext(CollectionsContext);
    const {currentUser} = useContext(UserContext);
    const {views} = useContext(MetadataViewContext);
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
            currentUser={currentUser}
            views={views}
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
            currentUser={currentUser}
            views={views}
            {...props}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualFilesPage));
