import React, {useContext, useEffect, useRef, useState} from 'react';
import {withRouter} from "react-router-dom";
import {useDropzone} from "react-dropzone";
import {Typography, withStyles} from "@material-ui/core";
import FileList from "./FileList";
import FileOperations from "./FileOperations";
import {useFiles} from "./UseFiles";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import {encodePath, splitPathIntoArray} from "./fileUtils";
import UploadProgressComponent from "./UploadProgressComponent";
import UploadsContext, {showCannotOverwriteDeletedError} from "./UploadsContext";
import {generateUuid} from "../metadata/common/metadataUtils";
import ConfirmationDialog from "../common/components/ConfirmationDialog";
import type {Collection} from "../collections/CollectionAPI";

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

const getConflictingFolders: string[] = (newFiles, existingFolderNames) => {
    const droppedFolderNames = new Set(
        newFiles
            .filter(f => splitPathIntoArray(f.path).length > 1)
            .map(f => splitPathIntoArray(f.path)[0])
    );
    return Array.from(droppedFolderNames).filter(f => existingFolderNames.includes(f));
};

const getConflictingFiles: string[] = (newFiles, existingFileNames) => (
    newFiles.filter(f => existingFileNames.includes(f.path)).map(c => c.name)
);

type ContextualFileBrowserProperties = {
    history: History;
    openedCollection: Collection;
    openedPath: string,
    isOpenedPathDeleted: boolean,
    showDeleted: boolean,
    loading: boolean,
    error: Error,
    selection: any,
    preselectedFile: File,
    classes: any
}

type FileBrowserProperties = ContextualFileBrowserProperties & {
    files: File[];
    refreshFiles: () => void;
    fileActions: any;
};

export const FileBrowser = (props: FileBrowserProperties) => {
    const {
        openedCollection = {},
        openedPath = "",
        isOpenedPathDeleted = false,
        files = [],
        showDeleted = false,
        refreshFiles = () => {},
        fileActions = {},
        selection = {},
        preselectedFile = {},
        classes = {},
        history
    } = props;
    const isWritingEnabled = openedCollection && openedCollection.canWrite && !isOpenedPathDeleted;

    const existingFileNames = files ? files.filter(file => file.type === "file").map(file => file.basename) : [];
    const existingFolderNames = files ? files.filter(file => file.type === "directory").map(file => file.basename) : [];

    const isOverwriteCandidateDeleted = (filenames: string[]) => {
        const fileCandidates = files ? files.filter(file => filenames.some(name => name === file.basename)) : [];
        return fileCandidates.length > 0 && fileCandidates.some(f => f.dateDeleted);
    };

    const {startUpload, maxFileSize} = useContext(UploadsContext);
    const [showOverwriteConfirmation, setShowOverwriteConfirmation] = useState(false);
    const [showCannotOverwriteWarning, setShowCannotOverwriteWarning] = useState(false);
    const [overwriteFileCandidateNames, setOverwriteFileCandidateNames] = useState([]);
    const [overwriteFolderCandidateNames, setOverwriteFolderCandidateNames] = useState([]);
    const [currentUpload, setCurrentUpload] = useState({});
    const [isFolderUpload, setIsFolderUpload] = useState();

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
            const newOverwriteFolderCandidates = getConflictingFolders(droppedFiles, existingFolderNames);
            const newOverwriteFileCandidates = getConflictingFiles(droppedFiles, existingFileNames);

            if (newOverwriteFileCandidates.length > 0 || newOverwriteFolderCandidates.length > 0) {
                setOverwriteFileCandidateNames(newOverwriteFileCandidates);
                setOverwriteFolderCandidateNames(newOverwriteFolderCandidates);
                if (isOverwriteCandidateDeleted([...newOverwriteFileCandidates, ...newOverwriteFolderCandidates])) {
                    setShowCannotOverwriteWarning(true);
                    return;
                }
                setCurrentUpload(newUpload);
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

    // A hook to make sure that isFolderUpload state is changed before opening the upload dialog
    useEffect(() => {
        if (isFolderUpload !== undefined) {
            open();
        }
    }, [isFolderUpload, open]);

    const isParentCollectionDeleted = openedCollection.dateDeleted != null;
    const parentCollectionDeletedRef = useRef(isParentCollectionDeleted);
    useEffect(() => {
        if (isParentCollectionDeleted !== parentCollectionDeletedRef.current) {
            refreshFiles();
            parentCollectionDeletedRef.current = isParentCollectionDeleted;
        }
    }, [isParentCollectionDeleted, refreshFiles]);

    useEffect(() => {
        if (showCannotOverwriteWarning) {
            setShowCannotOverwriteWarning(false);
            showCannotOverwriteDeletedError([...overwriteFileCandidateNames, ...overwriteFolderCandidateNames].length);
        }
    }, [overwriteFileCandidateNames, overwriteFolderCandidateNames, showCannotOverwriteWarning]);

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

    const uploadFolder = () => {
        if (isFolderUpload) {
            open();
        } else {
            setIsFolderUpload(true);
        }
    };

    const uploadFile = () => {
        if (!isFolderUpload) {
            open();
        } else {
            setIsFolderUpload(false);
        }
    };

    // A highlighting of a path means only this path would be selected/checked
    const handlePathHighlight = path => {
        const wasSelected = selection.isSelected(path.filename);
        selection.deselectAll();
        if (!wasSelected) {
            selection.select(path.filename);
        }
    };

    const handlePathDoubleClick = (path) => {
        if (path.type === 'directory') {
            /* TODO Remove additional encoding (encodeURI) after upgrading to history to version>=4.10
             *      This version contains this fix: https://github.com/ReactTraining/history/pull/656
             *      It requires react-router-dom version>=6 to be released.
             */
            history.push(`/collections${encodeURI(encodePath(path.filename))}`);
        }
    };

    const handleCloseUpload = () => {
        setShowOverwriteConfirmation(false);
        setOverwriteFileCandidateNames([]);
        setCurrentUpload({});
    };

    const renderOverwriteConfirmationMessage = () => (
        <Typography variant="body2" component="span">
            {(overwriteFolderCandidateNames.length > 1) && (
                <span>
                    Folders: <em>{overwriteFolderCandidateNames.join(', ')}</em> already exist <br />
                    and their content might be overwritten.<br />
                </span>
            )}
            {(overwriteFolderCandidateNames.length === 1) && (
                <span>
                    Folder <em>{overwriteFolderCandidateNames[0]} </em>
                    already exists and its content might be overwritten.<br />
                </span>
            )}
            {(overwriteFileCandidateNames.length > 1) && (
                <span>
                    Files: <em>{overwriteFileCandidateNames.join(', ')}</em> already exist.<br />
                </span>
            )}
            {(overwriteFileCandidateNames.length === 1) && (
                <span>
                    File <em>{overwriteFileCandidateNames[0]}</em> already exists.<br />
                </span>
            )}
            {(overwriteFolderCandidateNames.length + overwriteFileCandidateNames.length === 1) ? (
                <span>Do you want to <b>overwrite</b> it?</span>
            ) : (
                <span>Do you want to <b>overwrite</b> them?</span>
            )}
        </Typography>
    );

    const renderOverwriteConfirmation = () => (
        <ConfirmationDialog
            open
            title="Warning"
            content={renderOverwriteConfirmationMessage()}
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
                maxFileSize={maxFileSize}
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
                    preselectedFile={preselectedFile}
                />
                {openedCollection.canRead && renderFileOperations()}
            </div>
            <div className={classes.uploadProgress}>
                <UploadProgressComponent />
            </div>
            {showOverwriteConfirmation && (renderOverwriteConfirmation())}
        </div>
    );
};

const ContextualFileBrowser = (props: ContextualFileBrowserProperties) => {
    const {openedPath, showDeleted, loading, error} = props;
    const {files, loading: filesLoading, error: filesError, refresh, fileActions} = useFiles(openedPath, showDeleted);

    if (error || filesError) {
        return (<MessageDisplay message="An error occurred while loading files" />);
    }
    if (loading || filesLoading) {
        return <LoadingInlay />;
    }

    return (
        <FileBrowser
            files={files}
            showDeleted={showDeleted}
            refreshFiles={refresh}
            fileActions={fileActions}
            openedPath={openedPath}
            {...props}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualFileBrowser));
