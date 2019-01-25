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
    const fileAPI = new FileAPI(collection.location);

    if (clipboard.type === CUT) {
        return fileAPI.movePaths(clipboard.sourcedir, clipboard.filenames, destinationDir);
    } if (clipboard.type === COPY) {
        return fileAPI.copyPaths(clipboard.sourcedir, clipboard.filenames, destinationDir);
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
