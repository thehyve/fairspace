import React, {useContext, useEffect, useState} from 'react';
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
import UploadProgressComponent from "./UploadProgressComponent";
import UploadsContext from "./UploadsContext";
import {generateUuid} from "../metadata/common/metadataUtils";
import ConfirmationDialog from "../common/components/ConfirmationDialog";

const styles = (theme) => ({
    container: {
        height: "100%"
    },
    uploadProgress: {
        marginTop: 20
    },
    dropzone: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        outline: "none",
        transitionBorder: ".24s",
        easeInOut: true
    },
    activeStyle: {
        borderColor: theme.palette.info.main,
        borderWidth: 2,
        borderRadius: 2,
        borderStyle: "dashed",
        opacity: 0.4
    },
    acceptStyle: {
        borderColor: theme.palette.success.main
    },
    rejectStyle: {
        borderColor: theme.palette.error.main
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

    const {getUploads, startUpload} = useContext(UploadsContext);
    const [showOverwriteConfirmation, setShowOverwriteConfirmation] = useState(false);
    const [overwriteCandidateNames, setOverwriteCandidateNames] = useState([]);
    const [currentUpload, setCurrentUpload] = useState({});
    const [isFolderUpload, setIsFolderUpload] = useState(true);

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
        multiple: true,
        onDropAccepted: (droppedFiles) => {
            const newUpload = {
                id: generateUuid(),
                files: droppedFiles,
                destinationPath: openedPath,
            };
            const newOverwriteCandidates = droppedFiles.filter(f => existingFilenames.includes(f.name));
            if (newOverwriteCandidates.length > 0) {
                setCurrentUpload(newUpload);
                setOverwriteCandidateNames(newOverwriteCandidates.map(c => c.name));
                setShowOverwriteConfirmation(true);
            } else {
                startUpload(newUpload).then(refreshFiles);
            }
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

    useEffect(() => open(), [isFolderUpload, open]);

    const uploadFolder = () => setIsFolderUpload(true);
    const uploadFile = () => setIsFolderUpload(false);

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

    const handleCloseUpload = () => {
        setShowOverwriteConfirmation(false);
        setOverwriteCandidateNames([]);
        setCurrentUpload({});
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

    const renderOverwriteConfirmation = () => (
        <ConfirmationDialog
            open
            title="Warning"
            content={
                overwriteCandidateNames.length > 1 ? (
                    <span>
                        Files: <em>{overwriteCandidateNames.join(', ')}</em> already exist.<br />
                        Do you want to overwrite them?
                    </span>
                ) : (
                    <span>
                        File <em>{overwriteCandidateNames[0]}</em> already exists.<br />
                        Do you want to overwrite it?
                    </span>
                )
            }
            dangerous
            agreeButtonText="Overwrite"
            onAgree={() => {
                startUpload(currentUpload).then(refreshFiles);
                handleCloseUpload();
            }}
            onDisagree={handleCloseUpload}
            onClose={handleCloseUpload}
        />
    );

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
                uploadFolder={uploadFolder}
                uploadFile={uploadFile}
            />
        </div>
    );

    return (
        <div data-testid="files-view" className={classes.container}>
            <div
                {...getRootProps()}
                className={`${classes.dropzone} ${isDragActive && classes.activeStyle} ${isDragAccept && classes.acceptStyle} ${isDragReject && classes.rejectStyle}`}
            >
                <input {...getInputProps()} {...(isFolderUpload && {webkitdirectory: ""})} />
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
            {getUploads().length > 0 && (
                <div className={classes.uploadProgress}>
                    <UploadProgressComponent uploads={getUploads()} />
                </div>
            )}
            {showOverwriteConfirmation && (renderOverwriteConfirmation())}
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
