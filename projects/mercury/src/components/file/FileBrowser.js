import React, {useEffect, useState} from 'react';
import {withRouter} from "react-router-dom";

import {BottomNavigation, BottomNavigationAction, Button, Grid, Icon} from "@material-ui/core";
import {Play} from "mdi-material-ui";
import {LoadingInlay, MessageDisplay} from "../common";
import FileList from "./FileList";
import FileOperations from "./FileOperations";
import FileAPI from "../../services/FileAPI";
import useSelection from "./useSelection";
import UploadList from "./UploadList";

const TAB_FILES = 'FILES';
const TAB_UPLOAD = 'UPLOAD';

const FileBrowser = ({
    history,
    files = [],
    openedCollection,
    openedPath,
    fetchFilesIfNeeded,
    loading,
    error
}) => {
    const [currentTab, setCurrentTab] = useState(TAB_FILES);
    const {select, selectAll, deselectAll, toggle, isSelected} = useSelection(files.map(f => f.filename));

    // Deselect all files on history changes
    useEffect(() => {
        const historyListener = history.listen(() => {
            deselectAll();
        });

        // Specify how to clean up after this effect:
        return historyListener;
    });

    // A highlighting of a path means only this path would be selected/checked
    const handlePathHighlight = path => {
        deselectAll();
        select(path.filename);
    };

    const handlePathDoubleClick = (path) => {
        if (path.type === 'directory') {
            history.push(`/collections${path.filename}`);
        } else {
            FileAPI.open(path.filename);
        }
    };

    const renderFileList = () => (
        <FileList
            selectionEnabled
            files={files.map(item => ({...item, selected: isSelected(item.filename)}))}
            onPathCheckboxClick={path => toggle(path.filename)}
            onPathHighlight={handlePathHighlight}
            onPathDoubleClick={handlePathDoubleClick}
            onAllSelection={shouldSelectAll => (shouldSelectAll ? selectAll() : deselectAll())}
        />
    );

    const renderFileOperations = () => (
        <FileOperations
            openedCollection={openedCollection}
            openedPath={openedPath}
            disabled={!openedCollection.canWrite}
            existingFiles={files ? files.map(file => file.basename) : []}
            getDownloadLink={FileAPI.getDownloadLink}
            fetchFilesIfNeeded={fetchFilesIfNeeded}
        />
    );

    const renderUploadOperations = () => (
        <Button variant="contained">
            <Play /> Start uploading
        </Button>
    );

    const renderUploadList = () => <UploadList />;

    if (error) {
        return (<MessageDisplay message="An error occurred while loading files" />);
    }

    if (loading) {
        return <LoadingInlay />;
    }

    const collectionExists = openedCollection && openedCollection.iri;
    if (!collectionExists) {
        return (
            <MessageDisplay
                message="This collection does not exist or you don't have sufficient permissions to view it."
                variant="h6"
                noWrap={false}
            />
        );
    }

    return (
        <>
            {(currentTab === TAB_FILES) ? renderFileList() : renderUploadList()}

            <Grid container justify="space-between" style={{marginTop: 8}}>
                <Grid item>
                    {(currentTab === TAB_FILES) ? renderFileOperations() : renderUploadOperations()}
                </Grid>

                <Grid item>
                    <BottomNavigation
                        value={currentTab}
                        onChange={(e, tab) => setCurrentTab(tab)}
                        style={{backgroundColor: 'inherit'}}
                        showLabels
                    >
                        <BottomNavigationAction label="Files" value={TAB_FILES} icon={<Icon>folder_open</Icon>} />
                        <BottomNavigationAction label="Upload" value={TAB_UPLOAD} icon={<Icon>cloud_upload</Icon>} />
                    </BottomNavigation>
                </Grid>
            </Grid>
        </>
    );
};

export default withRouter(FileBrowser);
