import React from 'react';
import {Grid, AppBar, Tabs, Tab} from '@material-ui/core';

import CollectionList from '../collections/CollectionList';
import FileList from '../file/FileList';
import {COLLECTION_SEARCH_TYPE, FILES_SEARCH_TYPE} from '../../constants';
import {LoadingInlay} from "../common";

const getSelectedTabIndex = (type) => {
    switch (type) {
        case COLLECTION_SEARCH_TYPE:
            return 0;
        case FILES_SEARCH_TYPE:
            return 1;
        default:
            return false;
    }
};

const searchResults = ({
    loading,
    type,
    results,
    onTypeChange,
    onCollectionOpen,
    onFileOpen,
}) => {
    const selectedTabIndex = getSelectedTabIndex(type);
    const resultsToView = results && results.length === 0
        ? 'No results found!'
        : (
            <Grid item xs={12}>
                {selectedTabIndex === 0 && (
                    <CollectionList
                        collections={results}
                        onCollectionClick={() => {}}
                        onCollectionDoubleClick={onCollectionOpen}
                    />
                )}
                {selectedTabIndex === 1 && (
                    <FileList
                        files={results}
                        selectedPaths={[]}
                        onPathClick={() => {}}
                        onPathDoubleClick={onFileOpen}
                        onRename={() => {}}
                        onDelete={() => {}}
                    />
                )}
            </Grid>
        );

    return (
        <Grid container spacing={8}>
            <Grid item xs={12}>
                <AppBar square elevation={2} position="static" color="default">
                    <Tabs
                        value={selectedTabIndex}
                        onChange={(e, idx) => onTypeChange(idx === 0 ? COLLECTION_SEARCH_TYPE : FILES_SEARCH_TYPE)}
                        centered
                    >
                        <Tab disabled={loading} label="Collections" />
                        <Tab disabled={loading} label="Files" />
                    </Tabs>
                </AppBar>
            </Grid>
            {loading ? <LoadingInlay /> : resultsToView}
        </Grid>
    );
};

export default searchResults;
