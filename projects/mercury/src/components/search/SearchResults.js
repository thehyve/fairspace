import React from 'react';
import {Grid, AppBar, Tabs, Tab} from '@material-ui/core';

import CollectionList from '../collections/CollectionList';
import FileList from '../file/FileList';
import {COLLECTION_SEARCH_TYPE, FILES_SEARCH_TYPE} from '../../constants';
import {LoadingInlay} from "../common";

const searchResults = ({
    loading,
    type,
    results,
    onTypeChange,
    onCollectionOpen,
    onFileOpen,
}) => {
    const selectedTabIndex = type === FILES_SEARCH_TYPE ? 1 : 0;
    const resultsToView = results && results.length === 0
        ? 'No results found!' // TODO: make ErrorMessage generic and use it as an 'information' message here
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
