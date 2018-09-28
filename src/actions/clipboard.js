import FileAPIFactory from "../services/FileAPI/FileAPIFactory";

export const clear = () => ({
    type: "CLIPBOARD_CLEAR"
})

export const cut = (sourcedir, filenames) => ({
    type: "CLIPBOARD_CUT",
    sourcedir: sourcedir,
    filenames: filenames
})

export const copy = (sourcedir, filenames) => ({
    type: "CLIPBOARD_COPY",
    sourcedir: sourcedir,
    filenames: filenames
})

export const paste = (destinationDir) =>
    (dispatch, getState) => {
        const {clipboard, collectionBrowser, cache: { collections }} = getState();
        const currentCollection = collections.data[collectionBrowser.openedCollectionId];

        if(canPaste(clipboard)) {
            return dispatch(pasteAction(clipboard, currentCollection, destinationDir))
        } else {
            return Promise.resolve();
        }
    }

const canPaste = (clipboard) => clipboard.type && clipboard.filenames.length > 0

const pasteAction = (clipboard, currentCollection, destinationDir) => ({
    type: "CLIPBOARD_PASTE",
    payload: doPaste(clipboard, currentCollection, destinationDir)
});

const doPaste = (clipboard, currentCollection, destinationDir) => {
    const fileAPI = FileAPIFactory.build(currentCollection);

    if(clipboard.type == 'CUT') {
        return fileAPI.movePaths(clipboard.sourcedir, clipboard.filenames, destinationDir);
    } else {
        return fileAPI.copyPaths(clipboard.sourcedir, clipboard.filenames, destinationDir);
    }
}
