import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import FileAPI from "../services/FileAPI";
import * as actionTypes from "./actionTypes";
import {joinPaths} from '../utils/fileUtils';

export const invalidateFiles = (collection, path) => ({
    type: actionTypes.INVALIDATE_FETCH_FILES,
    meta: {
        collection,
        path
    }
});

export const renameFile = (path, currentFilename, newFilename) => {
    const from = joinPaths(path, currentFilename);
    const to = joinPaths(path, newFilename);

    return {
        type: actionTypes.RENAME_FILE,
        payload: FileAPI.move(from, to),
        meta: {
            path,
            currentFilename,
            newFilename
        }
    };
};

export const deleteMultiple = (paths) => (
    {
        type: actionTypes.DELETE_FILES,
        payload: FileAPI.deleteMultiple(paths),
        meta: {
            paths
        }
    });

export const uploadFiles = (path, files, nameMapping) => ({
    type: actionTypes.UPLOAD_FILES,
    payload: FileAPI.upload(path, files, nameMapping),
    meta: {
        path, files, nameMapping
    }
});

export const createDirectory = (path) => ({
    type: actionTypes.CREATE_DIRECTORY,
    payload: FileAPI.createDirectory(path),
    meta: {path}
});

const fetchFiles = createErrorHandlingPromiseAction((path) => ({
    type: actionTypes.FETCH_FILES,
    payload: FileAPI.list(path),
    meta: {
        path
    }
}));

export const fetchFilesIfNeeded = (path) => dispatchIfNeeded(
    () => fetchFiles(path),
    (state) => state.cache.filesByPath[path]
);

export const statFile = createErrorHandlingPromiseAction((path) => ({
    type: actionTypes.STAT_FILE,
    payload: FileAPI.stat(path),
    meta: {path}
}));

export const invalideFileStat = path => ({
    type: actionTypes.INVALIDATE_STAT_FILE,
    meta: {path}
});

export const statFileIfNeeded = path => dispatchIfNeeded(
    () => statFile(path),
    state => state.cache.fileInfoByPath[path]
);
