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
    const fileApi = new FileAPI(collection.location);
    const from = joinPaths(path, currentFilename);
    const to = joinPaths(path, newFilename);

    return {
        type: actionTypes.RENAME_FILE,
        payload: fileApi.move(from, to),
        meta: {
            collection, path, currentFilename, newFilename
        }
    };
};

export const deleteFile = (collection, path, basename) => {
    const fileApi = new FileAPI(collection.location);
    const filename = joinPaths(path, basename);

    return {
        type: actionTypes.DELETE_FILE,
        payload: fileApi.delete(filename),
        meta: {
            collection, path, basename, fullpath: fileApi.getFullPath(filename)
        }
    };
};

export const uploadFiles = (collection, path, files, nameMapping) => {
    const fileApi = new FileAPI(collection.location);
    return {
        type: actionTypes.UPLOAD_FILES,
        payload: fileApi.upload(path, files, nameMapping),
        meta: {
            collection, path, files, nameMapping
        }
    };
};

export const createDirectory = (collection, path, directoryname) => {
    const fileApi = new FileAPI(collection.location);
    return {
        type: actionTypes.CREATE_DIRECTORY,
        payload: fileApi.createDirectory(joinPaths(path, directoryname)),
        meta: {collection, path, directoryname}
    };
};

const fetchFiles = createErrorHandlingPromiseAction((collection, path) => ({
    type: actionTypes.FETCH_FILES,
    payload: new FileAPI(collection.location).list(path),
    meta: {
        collection,
        path
    }
}));

export const fetchFilesIfNeeded = (collection, path) => dispatchIfNeeded(
    () => fetchFiles(collection, path),
    (state) => {
        const filesPerCollection = state.cache.filesByCollectionAndPath[collection.id] || {};
        return filesPerCollection[path];
    }
);
