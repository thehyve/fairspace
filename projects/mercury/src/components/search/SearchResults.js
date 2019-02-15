import React from 'react';
import {Grid, AppBar, Tabs, Tab} from '@material-ui/core';

import CollectionList from '../collections/CollectionList';
import FileList from '../file/FileList';
import {COLLECTION_SEARCH_TYPE, FILES_SEARCH_TYPE} from '../../constants';

const searchResults = ({
    type,
    results,
    onTypeChange,
    onCollectionOpen,
    onFileOpen
}) => {
    const selectedTabIndex = type === COLLECTION_SEARCH_TYPE ? 0 : 1;

    return (
        <Grid container spacing={8}>
            <Grid item xs={12}>
                <AppBar square elevation={2} position="static" color="default">
                    <Tabs
                        value={selectedTabIndex}
                        onChange={(e, idx) => onTypeChange(idx === 0 ? COLLECTION_SEARCH_TYPE : FILES_SEARCH_TYPE)}
                        centered
                    >
                        <Tab label="Collections" />
                        <Tab label="Files" />
                    </Tabs>
                </AppBar>
            </Grid>
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
        </Grid>
    );
};

export default searchResults;
