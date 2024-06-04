import React, {useContext, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import {Divider, Switch} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import usePageTitleUpdater from '../common/hooks/UsePageTitleUpdater';

import CollectionBreadcrumbsContextProvider from './CollectionBreadcrumbsContextProvider';
import CollectionBrowser from './CollectionBrowser';
import CollectionInformationDrawer from './CollectionInformationDrawer';
import {useSingleSelection} from '../file/UseSelection';
import LoadingOverlay from '../common/components/LoadingOverlay';
import SearchBar from '../search/SearchBar';
import BreadCrumbs from '../common/components/BreadCrumbs';
import ConfirmationDialog from '../common/components/ConfirmationDialog';
import styles from './CollectionsPage.styles';
import CollectionsContext from './CollectionsContext';
import {getMetadataViewsPath, RESOURCES_VIEW} from '../metadata/views/metadataViewUtils';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import UserContext from '../users/UserContext';
import {handleTextSearchRedirect} from '../search/searchUtils';

type CollectionsPageProperties = {
    history: History,
    showBreadCrumbs: boolean,
    workspaceIri: string,
    documentTitle: string,
    classes: any
};

const CollectionsPage = (props: CollectionsPageProperties) => {
    const {showBreadCrumbs = false, history, workspaceIri, documentTitle, classes} = props;

    usePageTitleUpdater(documentTitle || 'Collections');

    const {collections, collectionsLoading, collectionsError} = useContext(CollectionsContext);
    const {views} = useContext(MetadataViewContext);
    const {currentUser} = useContext(UserContext);

    const [busy, setBusy] = useState(false);
    const [showDeletedCollections, setShowDeletedCollections] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [hasCollectionMetadataUpdates, setHasCollectionMetadataUpdates] = useState(false);
    const {isSelected, toggle, selected} = useSingleSelection();
    const [preselectedCollectionIri, setPreselectedCollectionIri] = useState(false);

    const handleSearch = value => {
        handleTextSearchRedirect(history, value);
    };

    let unmounting = false;

    useEffect(
        () =>
            function cleanup() {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                unmounting = true;
            }
    );

    const toggleCollection = collectionIri => {
        if (unmounting) {
            return;
        }
        setPreselectedCollectionIri(collectionIri);
        if (hasCollectionMetadataUpdates) {
            setShowConfirmDialog(true);
        } else {
            toggle(collectionIri);
        }
    };

    const handleConfirmSwitchCollection = () => {
        setShowConfirmDialog(false);
        toggle(preselectedCollectionIri);
    };

    const handleCancelSwitchCollection = () => setShowConfirmDialog(false);

    const showMetadataSearchButton =
        currentUser && currentUser.canViewPublicMetadata && views && views.some(v => v.name === RESOURCES_VIEW);

    return (
        <CollectionBreadcrumbsContextProvider>
            {showBreadCrumbs && <BreadCrumbs />}
            <Grid container justifyContent="space-between" spacing={1}>
                <Grid item className={classes.topBar}>
                    <Grid container>
                        <Grid item xs={6}>
                            <SearchBar
                                placeholder="Search in all collections"
                                onSearchChange={handleSearch}
                                disabled={
                                    collectionsLoading || collectionsError || !collections || collections.length === 0
                                }
                            />
                        </Grid>
                        {showMetadataSearchButton && (
                            <Grid item container xs={4} justifyContent="flex-end">
                                <Grid item className={classes.metadataButton}>
                                    <Button variant="text" color="primary" href={getMetadataViewsPath(RESOURCES_VIEW)}>
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
                                        checked={showDeletedCollections}
                                        onChange={() => setShowDeletedCollections(!showDeletedCollections)}
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
                    <CollectionBrowser
                        setBusy={setBusy}
                        isSelected={collection => isSelected(collection.iri)}
                        toggleCollection={collection => toggleCollection(collection.iri)}
                        workspaceIri={workspaceIri}
                        showDeletedCollections={showDeletedCollections}
                    />
                </Grid>
                <Grid item className={classes.sidePanel}>
                    <CollectionInformationDrawer
                        inCollectionsBrowser
                        setBusy={setBusy}
                        selectedCollectionIri={selected}
                        onChangeOwner={() => {
                            if (workspaceIri) {
                                toggleCollection(selected);
                            }
                        }}
                        setHasCollectionMetadataUpdates={setHasCollectionMetadataUpdates}
                    />
                </Grid>
            </Grid>
            {showConfirmDialog ? (
                <ConfirmationDialog
                    open
                    title="Unsaved changes"
                    content={
                        'You have unsaved changes, are you sure you want to navigate away?' +
                        ' Your pending changes will be lost.'
                    }
                    agreeButtonText="Navigate"
                    disagreeButtonText="back to form"
                    onAgree={handleConfirmSwitchCollection}
                    onDisagree={handleCancelSwitchCollection}
                />
            ) : null}
            <LoadingOverlay loading={busy} />
        </CollectionBreadcrumbsContextProvider>
    );
};

export default withStyles(styles)(CollectionsPage);
