import FileAPI from "../services/FileAPI";
import * as actionTypes from "./actionTypes";
import {COPY, CUT} from '../constants';

export const clear = () => ({
    type: actionTypes.CLIPBOARD_CLEAR
});

const extractBasename = filename => (filename.indexOf('/') > -1
    ? filename.substring(filename.lastIndexOf('/') + 1) : filename);

const canPaste = clipboard => clipboard.type && clipboard.filenames.length > 0;

const doPaste = (clipboard, collection, destinationDir) => {
    if (clipboard.type === CUT) {
        return FileAPI.movePaths(collection.location + clipboard.sourcedir, clipboard.filenames, collection.location + destinationDir);
    } if (clipboard.type === COPY) {
        return FileAPI.copyPaths(collection.location + clipboard.sourcedir, clipboard.filenames, collection.location + destinationDir);
    }

    return Promise.reject(Error("Invalid clipboard type"));
};

const pasteAction = (clipboard, collection, destinationDir) => ({
    type: actionTypes.CLIPBOARD_PASTE,
    payload: doPaste(clipboard, collection, destinationDir),
    meta: {
        collection,
        destinationDir,
        sourceDir: clipboard.sourcedir
    }
});

export const cut = (sourcedir, filenames) => ({
    type: actionTypes.CLIPBOARD_CUT,
    sourcedir,
    filenames: filenames.map(extractBasename)
});

export const copy = (sourcedir, filenames) => ({
    type: actionTypes.CLIPBOARD_COPY,
    sourcedir,
    filenames: filenames.map(extractBasename)
});

export const paste = (collection, destinationDir) => (dispatch, getState) => {
    const {clipboard} = getState();

    if (canPaste(clipboard)) {
        return dispatch(pasteAction(clipboard, collection, destinationDir));
    }
    return Promise.resolve();
};
