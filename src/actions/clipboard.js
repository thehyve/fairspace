import FileAPIFactory from "../services/FileAPI/FileAPIFactory";
import {CLIPBOARD_CLEAR, CLIPBOARD_COPY, CLIPBOARD_CUT, CLIPBOARD_PASTE} from "./actionTypes";

export const CUT = 'CUT';
export const COPY = 'COPY';

export const clear = () => ({
    type: CLIPBOARD_CLEAR
})

export const cut = (sourcedir, filenames) => ({
    type: CLIPBOARD_CUT,
    sourcedir: sourcedir,
    filenames: filenames.map(extractBasename)
})

export const copy = (sourcedir, filenames) => ({
    type: CLIPBOARD_COPY,
    sourcedir: sourcedir,
    filenames: filenames.map(extractBasename)
})

export const paste = (collection, destinationDir) =>
    (dispatch, getState) => {
        const {clipboard} = getState();

        if(canPaste(clipboard)) {
            return dispatch(pasteAction(clipboard, collection, destinationDir))
        } else {
            return Promise.resolve();
        }
    }

const canPaste = (clipboard) => clipboard.type && clipboard.filenames.length > 0

const pasteAction = (clipboard, collection, destinationDir) => ({
    type: CLIPBOARD_PASTE,
    payload: doPaste(clipboard, collection, destinationDir),
    meta: {
        collection,
        destinationDir,
        sourceDir: clipboard.sourcedir
    }
});

const doPaste = (clipboard, collection, destinationDir) => {
    const fileAPI = FileAPIFactory.build(collection);

    if(clipboard.type === CUT) {
        return fileAPI.movePaths(clipboard.sourcedir, clipboard.filenames, destinationDir);
    } else if(clipboard.type === COPY) {
        return fileAPI.copyPaths(clipboard.sourcedir, clipboard.filenames, destinationDir);
    } else {
        return Promise.reject("Invalid clipboard type");
    }
}

const extractBasename = filename => filename.indexOf('/') > -1 ? filename.substring(filename.lastIndexOf('/')+1) : filename;
