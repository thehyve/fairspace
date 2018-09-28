import FileAPIFactory from "../services/FileAPI/FileAPIFactory";

export const cut = (sourcedir, paths) => ({
    type: "CLIPBOARD_CUT",
    sourcedir: sourcedir,
    paths: paths
})

export const copy = (sourcedir, paths) => ({
    type: "CLIPBOARD_COPY",
    sourcedir: sourcedir,
    paths: paths
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

const canPaste = (clipboard) => clipboard.type && clipboard.paths.length > 0

const pasteAction = (clipboard, currentCollection, destinationDir) => ({
    type: "CLIPBOARD_PASTE",
    payload: doPaste(clipboard, currentCollection, destinationDir)
});

const doPaste = (clipboard, currentCollection, destinationDir) => {
    const fileAPI = FileAPIFactory.build(currentCollection);

    if(clipboard.type == 'CUT') {
        return fileAPI.move(clipboard.sourcedir, clipboard.paths, destinationDir);
    } else {
        return fileAPI.copy(clipboard.sourcedir, clipboard.paths, destinationDir);
    }
}
