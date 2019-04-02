import * as actionTypes from "./actionTypes";

export const selectCollection = location => ({
    type: actionTypes.SELECT_COLLECTION,
    location
});

export const selectPath = path => ({
    type: actionTypes.SELECT_PATH,
    path
});

export const deselectPath = path => ({
    type: actionTypes.DESELECT_PATH,
    path
});

export const selectPaths = (paths) => ({
    type: actionTypes.SET_SELECTED_PATHS,
    paths
});

export const deselectAllPaths = () => ({
    type: actionTypes.DESELECT_ALL_PATHS
});
