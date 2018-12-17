import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import FileAPIFactory from "../services/FileAPI/FileAPIFactory";
import {
    CREATE_DIRECTORY, DELETE_FILE, FILES, RENAME_FILE, UPLOAD_FILES
} from "./actionTypes";
import * as actionTypes from "../utils/redux-action-types";

export const invalidateFiles = (collection, path) => ({
    type: actionTypes.invalidate(FILES),
    meta: {
        collection,
        path
    }
});

export const renameFile = (collection, path, currentFilename, newFilename) => {
    const fileApi = getFileApi(collection);
    return {
        type: RENAME_FILE,
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
        type: DELETE_FILE,
        payload: fileApi.delete(filename),
        meta: {
            collection, path, basename, fullpath: fileApi.getFullPath(filename)
        }
    };
};

export const uploadFiles = (collection, path, files, nameMapping) => {
    const fileApi = getFileApi(collection);
    return {
        type: UPLOAD_FILES,
        payload: fileApi.upload(path, files, nameMapping),
        meta: {
            collection, path, files, nameMapping
        }
    };
};

export const createDirectory = (collection, path, directoryname) => {
    const fileApi = getFileApi(collection);
    return {
        type: CREATE_DIRECTORY,
        payload: fileApi.createDirectory(fileApi.joinPaths(path, directoryname)),
        meta: {collection, path, directoryname}
    };
};

export const fetchFilesIfNeeded = (collection, path) => dispatchIfNeeded(
    () => fetchFiles(collection, path),
    (state) => {
        const filesPerCollection = state.cache.filesByCollectionAndPath[collection.id] || {};
        return filesPerCollection[path];
    }
);

const fetchFiles = createErrorHandlingPromiseAction((collection, path) => ({
    type: FILES,
    payload: getFileApi(collection).list(path),
    meta: {
        collection,
        path
    }
}));

const getFileApi = collection => FileAPIFactory.build(collection);
