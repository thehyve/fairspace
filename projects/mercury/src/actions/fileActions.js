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

export const renameFile = (collection, path, currentFilename, newFilename) => {
    const from = joinPaths(collection.location, path, currentFilename);
    const to = joinPaths(collection.location, path, newFilename);

    return {
        type: actionTypes.RENAME_FILE,
        payload: FileAPI.move(from, to),
        meta: {
            collection, path, currentFilename, newFilename
        }
    };
};

export const deleteFile = (collection, path, basename) => {
    const filename = joinPaths(collection.location, path, basename);

    return {
        type: actionTypes.DELETE_FILE,
        payload: FileAPI.delete(filename),
        meta: {
            collection, path, basename, fullpath: filename
        }
    };
};

export const uploadFiles = (collection, path, files, nameMapping) => {
    return {
        type: actionTypes.UPLOAD_FILES,
        payload: FileAPI.upload(joinPaths(collection.location, path), files, nameMapping),
        meta: {
            collection, path, files, nameMapping
        }
    };
};

export const createDirectory = (collection, path, directoryname) => {
    return {
        type: actionTypes.CREATE_DIRECTORY,
        payload: FileAPI.createDirectory(joinPaths(collection.location, path, directoryname)),
        meta: {collection, path, directoryname}
    };
};

const fetchFiles = createErrorHandlingPromiseAction((collection, path) => ({
    type: actionTypes.FETCH_FILES,
    payload:  FileAPI.list(collection.location + path),
    meta: {
        collection,
        path
    }
}));

export const fetchFilesIfNeeded = (collection, path) => dispatchIfNeeded(
    () => fetchFiles(collection, path),
    (state) => {
        const filesPerCollection = state.cache.filesByCollectionAndPath[collection.iri] || {};
        return filesPerCollection[path];
    }
);

export const statFile = createErrorHandlingPromiseAction((collection, path) => ({
    type: actionTypes.STAT_FILE,
    payload: FileAPI.stat(collection.location + path),
    meta: {
        collection,
        path
    }
}));
