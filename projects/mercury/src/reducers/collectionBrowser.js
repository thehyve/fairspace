import {
    CLOSE_INFODRAWER,
    DELETE_COLLECTION,
    DELETE_FILE,
    DESELECT_COLLECTION,
    DESELECT_PATH,
    OPEN_INFODRAWER,
    OPEN_PATH,
    CLOSE_PATH,
    SELECT_COLLECTION,
    SELECT_PATH,
    ADD_COLLECTION
} from "../actions/actionTypes";
import * as actionTypes from "../utils/redux-action-types";

const defaultState = {
    selectedCollectionId: null,
    selectedPaths: [],

    openedCollectionId: null,
    openedPath: null,

    infoDrawerOpened: false,
    addingCollection: false,
    deletingCollection: false
};

const deselectPath = (state, path) => {
    return {
        ...state,
        selectedPaths: (state.selectedPaths || []).filter(el => el !== path)
    };
}

const collectionBrowser = (state = defaultState, action) => {
    switch (action.type) {
        case SELECT_COLLECTION:
            return {
                ...state,
                infoDrawerOpened: true,
                selectedCollectionId: action.collectionId
            };
        case DESELECT_COLLECTION:
            return {
                ...state,
                infoDrawerOpened: false,
                selectedCollectionId: null
            };
        case SELECT_PATH:
            return {
                ...state,
                infoDrawerOpened: true,
                selectedPaths: (state.selectedPaths || []).concat(action.path)
            };
        case DESELECT_PATH:
            return deselectPath(state, action.path);
        case actionTypes.pending(DELETE_COLLECTION):
            return {
                ...state,
                deletingCollection: true
            };
        case actionTypes.fulfilled(DELETE_COLLECTION):
            return {
                ...state,
                deletingCollection: false,
                selectedCollectionId: state.selectedCollectionId === action.collectionId ? null : state.selectedCollectionId
            }
        case actionTypes.fulfilled(DELETE_FILE):
            return deselectPath(state, action.meta.fullpath);
        case actionTypes.pending(ADD_COLLECTION):
            return {
                ...state,
                addingCollection: true
            };
        case actionTypes.fulfilled(ADD_COLLECTION):
            return {
                ...state,
                addingCollection: false
            };
        case OPEN_INFODRAWER:
            return {
                ...state,
                infoDrawerOpened: true
            };
        case CLOSE_INFODRAWER:
            return {
                ...state,
                infoDrawerOpened: false
            };
        case OPEN_PATH:
            return {
                ...state,
                openedPath: action.path,
                selectedPaths: []
            };
        case CLOSE_PATH:
            return {
                ...state,
                openedPath: null,
                selectedPaths: []
            };
        default:
            return state;
    }
};

export default collectionBrowser;
