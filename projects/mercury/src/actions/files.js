import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import FileAPIFactory from "../services/FileAPI/FileAPIFactory";
import * as actionTypes from "./actionTypes";

export const invalidateFiles = (collection, path) => ({
    type: actionTypes.INVALIDATE_FETCH_FILES,
    meta: {
        collection,
        path
    }
});

const getFileApi = collection => FileAPIFactory.build(collection);

export const renameFile = (collection, path, currentFilename, newFilename) => {
    const fileApi = getFileApi(collection);
    return {
        type: actionTypes.RENAME_FILE,
        payload: fileApi.move(fileApi.joinPaths(path, currentFilename), fileApi.joinPaths(path, newFilename)),
        meta: {
            collection, path, currentFilename, newFilename
        }
    };
};

export const deleteFile = (collection, path, basename) => {
    const fileApi = getFileApi(collection);
    const filename = fileApi.joinPaths(path, basename);
    return {
        type: actionTypes.DELETE_FILE,
        payload: fileApi.delete(filename),
        meta: {
            collection, path, basename, fullpath: fileApi.getFullPath(filename)
        }
    };
};

export const uploadFiles = (collection, path, files, nameMapping) => {
    const fileApi = getFileApi(collection);
    return {
        type: actionTypes.UPLOAD_FILES,
        payload: fileApi.upload(path, files, nameMapping),
        meta: {
            collection, path, files, nameMapping
        }
    };
};

export const createDirectory = (collection, path, directoryname) => {
    const fileApi = getFileApi(collection);
    return {
        type: actionTypes.CREATE_DIRECTORY,
        payload: fileApi.createDirectory(fileApi.joinPaths(path, directoryname)),
        meta: {collection, path, directoryname}
    };
};

const fetchFiles = createErrorHandlingPromiseAction((collection, path) => ({
    type: actionTypes.FETCH_FILES,
    payload: getFileApi(collection).list(path),
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
