import * as actionTypes from "./actionTypes";

export const openCollection = collectionId => ({
    type: actionTypes.OPEN_COLLECTION,
    collectionId
});

export const selectCollection = collectionId => ({
    type: actionTypes.SELECT_COLLECTION,
    collectionId
});

export const openPath = path => ({
    type: actionTypes.OPEN_PATH,
    path
});

export const selectPath = path => ({
    type: actionTypes.SELECT_PATH,
    path
});

export const deselectPath = path => ({
    type: actionTypes.DESELECT_PATH,
    path
});
