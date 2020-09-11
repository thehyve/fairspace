import React, {useEffect} from 'react';
import {withRouter} from "react-router-dom";
import {useDropzone} from "react-dropzone";
import {withStyles} from "@material-ui/core";
import FileList from "./FileList";
import FileOperations from "./FileOperations";
import FileAPI from "./FileAPI";
import {useFiles} from "./UseFiles";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import {encodePath} from "./fileUtils";
import useUploads from "./UseUploads";

const styles = () => ({
    dropzone: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafafa",
        color: "#bdbdbd",
        outline: "none",
        transitionBorder: ".24s",
        easeInOut: true
    },
    activeStyle: {
        borderColor: '#2196f3',
        borderWidth: 2,
        borderRadius: 2,
        borderStyle: "dashed",
    },
    acceptStyle: {
        borderColor: '#00e676'
    },
    rejectStyle: {
        borderColor: '#ff1744'
    }
});

export const FileBrowser = ({
    history,
    openedCollection,
    collectionsLoading = false,
    collectionsError = false,
    openedPath,
    isOpenedPathDeleted,
    files = [],
    loading = false,
    error = false,
    showDeleted,
    refreshFiles = () => {},
    fileActions = {},
    selection = {},
    classes
}) => {
    const isWritingEnabled = openedCollection && openedCollection.canWrite && !isOpenedPathDeleted;
    const isReadingEnabled = openedCollection && openedCollection.canRead && !isOpenedPathDeleted;

    const existingFilenames = files ? files.map(file => file.basename) : [];
    const {uploads, enqueue, startAll} = useUploads(openedPath, existingFilenames, refreshFiles);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject,
        open
    } = useDropzone({
        noClick: true,
        noKeyboard: true,
        onDropAccepted: (droppedFiles) => {
            enqueue(droppedFiles);
            startAll();
        }
    });

    // Deselect all files on history changes
    useEffect(() => {
        const historyListener = history.listen(() => {
            selection.deselectAll();
        });

        // Specify how to clean up after this effect:
        return historyListener;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history]);

    // A highlighting of a path means only this path would be selected/checked
    const handlePathHighlight = path => {
        selection.deselectAll();
        selection.select(path.filename);
    };

    const handlePathDoubleClick = (path) => {
        if (path.type === 'directory') {
            /* TODO Remove additional encoding (encodeURI) after upgrading to history to version>=4.10
             *      This version contains this fix: https://github.com/ReactTraining/history/pull/656
             *      It requires react-router-dom version>=6 to be released.
             */
            history.push(`/collections${encodeURI(encodePath(path.filename))}`);
        } else if (isReadingEnabled) {
            FileAPI.open(path.filename);
        }
    };

    if (loading || collectionsLoading) {
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

    if (error || collectionsError) {
        return (<MessageDisplay message="An error occurred while loading files" />);
    }

    const renderFileOperations = () => (
        <div style={{marginTop: 8}}>
            <FileOperations
                selectedPaths={selection.selected}
                files={files}
                openedPath={openedPath}
                isWritingEnabled={isWritingEnabled}
                showDeleted={showDeleted}
                fileActions={fileActions}
                clearSelection={selection.deselectAll}
                refreshFiles={refreshFiles}
                openUploadFileDialog={open}
            />
        </div>
    );

    return (
        <div data-testid="files-view" className="container">
            <div
                {...getRootProps({isDragActive, isDragAccept, isDragReject})}
                className={`${classes.dropzone} ${isDragActive && classes.activeStyle} ${isDragAccept && classes.acceptStyle} ${isDragReject && classes.rejectStyle}`}
            >
                <input {...getInputProps()} />
                <FileList
                    selectionEnabled={openedCollection.canRead}
                    files={files.map(item => ({...item, selected: selection.isSelected(item.filename)}))}
                    onPathCheckboxClick={path => selection.toggle(path.filename)}
                    onPathHighlight={handlePathHighlight}
                    onPathDoubleClick={handlePathDoubleClick}
                    onAllSelection={shouldSelectAll => (shouldSelectAll ? selection.selectAll(files.map(file => file.filename)) : selection.deselectAll())}
                    showDeleted={showDeleted}
                />
                {openedCollection.canRead && renderFileOperations()}
            </div>
        </div>
    );
};

const ContextualFileBrowser = ({openedPath, fileApi, showDeleted, ...props}) => {
    const {files, loading, error, refresh, fileActions} = useFiles(openedPath, showDeleted, fileApi);
    return (
        <FileBrowser
            files={files}
            loading={loading}
            error={error}
            showDeleted={showDeleted}
            refreshFiles={refresh}
            fileActions={fileActions}
            openedPath={openedPath}
            fileApi={fileApi}
            {...props}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualFileBrowser));
