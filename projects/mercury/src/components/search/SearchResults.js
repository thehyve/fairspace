import React from 'react';
import {Grid, AppBar, Tabs, Tab} from '@material-ui/core';

import CollectionList from '../collections/CollectionList';
import FileList from '../file/FileList';

const searchResults = ({
    type = 'collections',
    onTypeChange,
    collections,
    files,
    onCollectionOpen,
    onFileOpen
}) => {
    const selectedTabIndex = type === 'collections' ? 0 : 1;
    return (
        <Grid container spacing={8}>
            <Grid item xs={12}>
                <AppBar square elevation={2} position="static" color="default">
                    <Tabs
                        value={selectedTabIndex}
                        onChange={(e, idx) => onTypeChange(idx === 0 ? 'collections' : 'files')}
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
                        collections={collections}
                        onCollectionClick={() => {}}
                        onCollectionDoubleClick={onCollectionOpen}
                    />
                )}
                {selectedTabIndex === 1 && (
                    <FileList
                        files={files}
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
