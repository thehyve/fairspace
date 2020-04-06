import React, {useContext, useState} from 'react';
import {Badge, IconButton} from "@material-ui/core";
import {CreateNewFolder} from '@material-ui/icons';
import ContentCopy from "mdi-material-ui/ContentCopy";
import ContentPaste from "mdi-material-ui/ContentPaste";
import Download from "mdi-material-ui/Download";
import {ErrorDialog} from "../common";

import {ProgressButton} from '../common/components';
import {CreateDirectoryButton} from "./buttons";
import {joinPaths} from "../common/utils/fileUtils";
import {COPY} from '../constants';
import FileOperationsGroup from "./FileOperationsGroup";
import ClipboardContext from '../common/contexts/ClipboardContext';

export const Operations = {
    PASTE: 'PASTE',
    MKDIR: 'MKDIR'
};
Object.freeze(Operations);

export const FileOperations = ({
    isWritingDisabled,
    openedPath,
    selectedPaths,
    clearSelection,
    fileActions = {},

    files,
    refreshFiles,
    clipboard
}) => {
    const [activeOperation, setActiveOperation] = useState();
    const busy = !!activeOperation;

    const noPathSelected = selectedPaths.length === 0;
    const selectedItems = files.filter(f => selectedPaths.includes(f.filename)) || [];
    const selectedItem = selectedItems && selectedItems.length === 1 ? selectedItems[0] : {};
    const moreThanOneItemSelected = selectedPaths.length > 1;
    const isDisabledForMoreThanOneSelection = selectedPaths.length === 0 || moreThanOneItemSelected;
    const isPasteDisabled = isWritingDisabled || clipboard.isEmpty();

    const fileOperation = (operationCode, operationPromise) => {
        setActiveOperation(operationCode);
        return operationPromise
            .then(r => {
                setActiveOperation();
                refreshFiles();
                clearSelection();
                return r;
            })
            .catch(e => {
                setActiveOperation();
                return Promise.reject(e);
            });
    };

    const handleCopy = e => {
        if (e) e.stopPropagation();
        clipboard.copy(selectedPaths);
    };

    const handlePaste = e => {
        if (e) e.stopPropagation();

        let operation;

        if (clipboard.method === COPY) {
            operation = fileActions.copyPaths(clipboard.filenames);
        }

        if (operation) {
            return fileOperation(Operations.PASTE, operation)
                .then(clipboard.clear)
                .catch((err) => {
                    ErrorDialog.showError(err, err.message || "An error occurred while pasting your contents");
                });
        }

        return Promise.resolve();
    };

    const handleCreateDirectory = name => fileOperation(Operations.MKDIR, fileActions.createDirectory(joinPaths(openedPath, name)))
        .catch((err) => {
            ErrorDialog.showError(err, err.message || "An error occurred while creating directory", () => handleCreateDirectory(name));
            return true;
        });

    const addBadgeIfNotEmpty = (badgeContent, children) => {
        if (badgeContent) {
            return (
                <Badge badgeContent={badgeContent} color="primary">
                    {children}
                </Badge>
            );
        }
        return children;
    };

    return (
        <>
            <FileOperationsGroup>
                <ProgressButton active={activeOperation === Operations.MKDIR}>
                    <CreateDirectoryButton
                        onCreate={name => handleCreateDirectory(name)}
                        disabled={isWritingDisabled || busy}
                    >
                        <IconButton
                            aria-label="Create directory"
                            title="Create directory"
                            disabled={isWritingDisabled || busy}
                        >
                            <CreateNewFolder />
                        </IconButton>
                    </CreateDirectoryButton>
                </ProgressButton>
            </FileOperationsGroup>
            <FileOperationsGroup>
                <IconButton
                    title={`Download ${selectedItem.basename}`}
                    aria-label={`Download ${selectedItem.basename}`}
                    disabled={isDisabledForMoreThanOneSelection || selectedItem.type !== 'file' || busy}
                    component="a"
                    href={fileActions.getDownloadLink(selectedItem.filename)}
                    download
                >
                    <Download />
                </IconButton>
            </FileOperationsGroup>
            <FileOperationsGroup>
                <IconButton
                    aria-label="Copy"
                    title="Copy"
                    onClick={e => handleCopy(e)}
                    disabled={noPathSelected || busy}
                >
                    <ContentCopy />
                </IconButton>
                <ProgressButton active={activeOperation === Operations.PASTE}>
                    <IconButton
                        aria-label="Paste"
                        title="Paste"
                        onClick={e => handlePaste(e)}
                        disabled={isPasteDisabled || busy}
                    >
                        {addBadgeIfNotEmpty(clipboard.length(), <ContentPaste />)}
                    </IconButton>
                </ProgressButton>
            </FileOperationsGroup>
        </>
    );
};

const ContextualFileOperations = props => {
    const clipboard = useContext(ClipboardContext);
    return <FileOperations clipboard={clipboard} {...props} />;
};

export default ContextualFileOperations;
