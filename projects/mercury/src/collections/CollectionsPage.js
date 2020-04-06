import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {BreadCrumbs, ConfirmationDialog, SearchBar, usePageTitleUpdater} from "../common";

import * as consts from '../constants';
import CollectionBreadcrumbsContextProvider from "./CollectionBreadcrumbsContextProvider";
import CollectionBrowser from "./CollectionBrowser";
import CollectionInformationDrawer from './CollectionInformationDrawer';
import {useSingleSelection} from "../file/UseSelection";
import {LoadingOverlay} from "../common/components";
import {handleCollectionSearchRedirect} from "../common/utils/collectionUtils";

const CollectionsPage = ({history, showBreadCrumbs, workspaceIri}) => {
    usePageTitleUpdater("Collections");

    const [busy, setBusy] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [hasCollectionMetadataUpdates, setHasCollectionMetadataUpdates] = useState(false);
    const {isSelected, toggle, selected} = useSingleSelection();
    const [preselectedCollectionIri, setPreselectedCollectionIri] = useState(false);

    const handleSearch = (value) => {
        handleCollectionSearchRedirect(history, value);
    };

    const toggleCollection = (collectionIri) => {
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

    return (
        <CollectionBreadcrumbsContextProvider>
            {showBreadCrumbs && <BreadCrumbs /> }
            <div style={{marginBottom: 16, width: consts.MAIN_CONTENT_WIDTH}}>
                <SearchBar
                    placeholder="Search"
                    disableUnderline={false}
                    onSearchChange={handleSearch}
                />
            </div>
            <Grid container spacing={1}>
                <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                    <CollectionBrowser
                        isSelected={collection => isSelected(collection.iri)}
                        toggleCollection={collection => toggleCollection(collection.iri)}
                        workspaceIri={workspaceIri}
                    />
                </Grid>
                <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                    <CollectionInformationDrawer
                        inCollectionsBrowser
                        setBusy={setBusy}
                        selectedCollectionIri={selected}
                        setHasCollectionMetadataUpdates={setHasCollectionMetadataUpdates}
                    />
                </Grid>
            </Grid>
            {showConfirmDialog ? (
                <ConfirmationDialog
                    open
                    title="Unsaved changes"
                    content={'You have unsaved changes, are you sure you want to navigate away?'
                    + ' Your pending changes will be lost.'}
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

export default CollectionsPage;
