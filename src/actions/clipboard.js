import FileAPIFactory from "../services/FileAPI/FileAPIFactory";

export const clear = () => ({
    type: "CLIPBOARD_CLEAR"
})

export const cut = (sourcedir, filenames) => ({
    type: "CLIPBOARD_CUT",
    sourcedir: sourcedir,
    filenames: filenames.map(extractBasename)
})

export const copy = (sourcedir, filenames) => ({
    type: "CLIPBOARD_COPY",
    sourcedir: sourcedir,
    filenames: filenames.map(extractBasename)
})

export const paste = (openedCollection, destinationDir) =>
    (dispatch, getState) => {
        const {clipboard} = getState();

        if(canPaste(clipboard)) {
            return dispatch(pasteAction(clipboard, openedCollection, destinationDir))
        } else {
            return Promise.resolve();
        }
    }

const canPaste = (clipboard) => clipboard.type && clipboard.filenames.length > 0

const pasteAction = (clipboard, collection, destinationDir) => ({
    type: "CLIPBOARD_PASTE",
    payload: doPaste(clipboard, collection, destinationDir),
    meta: {
        collection,
        destinationDir,
        sourceDir: clipboard.sourcedir
    }
});

const doPaste = (clipboard, currentCollection, destinationDir) => {
    const fileAPI = FileAPIFactory.build(currentCollection);

    if(clipboard.type === 'CUT') {
        return fileAPI.movePaths(clipboard.sourcedir, clipboard.filenames, destinationDir);
    } else {
        return fileAPI.copyPaths(clipboard.sourcedir, clipboard.filenames, destinationDir);
    }
}

const extractBasename = filename => filename.indexOf('/') > -1 ? filename.substring(filename.lastIndexOf('/')+1) : filename;
