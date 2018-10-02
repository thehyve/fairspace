import {createErrorHandlingPromiseAction} from "../utils/redux";
import FileAPIFactory from "../services/FileAPI/FileAPIFactory";
import {CREATE_DIRECTORY, DELETE_FILE, FILES, RENAME_FILE, UPLOAD_FILES} from "./actionTypes";
import * as actionTypes from "../utils/redux-action-types";

export const invalidateFiles = (collection, path) => ({
    type: actionTypes.invalidate(FILES),
    meta: {
        collection,
        path
    }
})

export const renameFile = (collection, path, currentFilename, newFilename) => {
    const fileApi = getFileApi(collection);
    return {
        type: RENAME_FILE,
        payload: fileApi.move(fileApi.joinPaths(path, currentFilename), fileApi.joinPaths(path, newFilename)),
        meta: {collection, path, currentFilename, newFilename}
    }
}

export const deleteFile = (collection, path, basename) => {
    const fileApi = getFileApi(collection);
    const filename = fileApi.joinPaths(path, basename);
    return {
        type: DELETE_FILE,
        payload: fileApi.delete(filename),
        meta: {collection, path, basename, fullpath: fileApi.getFullPath(filename)}
    }
}

export const uploadFiles = (collection, path, files) => {
    const fileApi = getFileApi(collection);
    return {
        type: UPLOAD_FILES,
        payload: fileApi.upload(path, files),
        meta: {collection, path, files}
    }
}

export const createDirectory = (collection, path, directoryname) => {
    const fileApi = getFileApi(collection);
    return {
        type: CREATE_DIRECTORY,
        payload: fileApi.createDirectory(fileApi.joinPaths(path, directoryname)),
        meta: {collection, path, directoryname}
    }
}

export const fetchFilesIfNeeded = (collection, path) => {
    return (dispatch, getState) => {
        if (shouldFetchFiles(getState(), collection, path)) {
            return dispatch(fetchFiles(collection, path))
        } else {
            return Promise.resolve();
        }
    }
}

const shouldFetchFiles = (state, collection, path) => {
    const filesPerCollection = state.cache.filesByCollectionAndPath[collection.id] || {};
    const files = filesPerCollection[path];

    if (!files) {
        return true
    } else if (files.pending) {
        return false
    } else {
        return files.invalidated
    }
}

const fetchFiles = createErrorHandlingPromiseAction((collection, path) => {
    return {
        type: FILES,
        payload: getFileApi(collection).list(path),
        meta: {
            collection: collection,
            path: path
        }
    }
});

const getFileApi = (collection) => FileAPIFactory.build(collection);
