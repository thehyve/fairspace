import FileAPI from "../services/FileAPI";
import * as actionTypes from "./actionTypes";
import {COPY, CUT} from '../constants';

export const clear = () => ({
    type: actionTypes.CLIPBOARD_CLEAR
});

const canPaste = clipboard => clipboard.type && clipboard.filenames.length > 0;

const doPaste = (clipboard, destinationDir) => {
    if (clipboard.type === CUT) {
        return FileAPI.movePaths(clipboard.filenames, destinationDir);
    } if (clipboard.type === COPY) {
        return FileAPI.copyPaths(clipboard.filenames, destinationDir);
    }

    return Promise.reject(Error("Invalid clipboard type"));
};

const pasteAction = (clipboard, destinationDir) => ({
    type: actionTypes.CLIPBOARD_PASTE,
    payload: doPaste(clipboard, destinationDir),
    meta: {
        filenames: clipboard.filenames,
        destinationDir
    }
});

export const cut = (filenames) => ({
    type: actionTypes.CLIPBOARD_CUT,
    filenames
});

export const copy = (filenames) => ({
    type: actionTypes.CLIPBOARD_COPY,
    filenames
});

export const paste = (destinationDir) => (dispatch, getState) => {
    const {clipboard} = getState();

    if (canPaste(clipboard)) {
        return dispatch(pasteAction(clipboard, destinationDir));
    }
    return Promise.resolve();
};
