import * as actionTypes from "../actions/actionTypes";

const defaultState = {
    selectedCollectionId: null,
    selectedPaths: [],
    openedCollectionId: null,
    openedPath: null,
    infoDrawerOpened: false,
    addingCollection: false,
    deletingCollection: false
};

const deselectPath = (state, path) => ({
    ...state,
    selectedPaths: (state.selectedPaths || []).filter(el => el !== path)
});

const collectionBrowser = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.SELECT_COLLECTION:
            return {
                ...state,
                infoDrawerOpened: true,
                selectedCollectionId: action.collectionId
            };
        case actionTypes.DESELECT_COLLECTION:
            return {
                ...state,
                infoDrawerOpened: false,
                selectedCollectionId: null
            };
        case actionTypes.SELECT_PATH:
            return {
                ...state,
                infoDrawerOpened: true,
                selectedPaths: (state.selectedPaths || []).concat(action.path)
            };
        case actionTypes.DESELECT_PATH:
            return deselectPath(state, action.path);
        case actionTypes.DELETE_COLLECTION_PENDING:
            return {
                ...state,
                deletingCollection: true
            };
        case actionTypes.DELETE_COLLECTION_FULFILLED:
            return {
                ...state,
                deletingCollection: false,
                selectedCollectionId: state.selectedCollectionId === action.collectionId ? null : state.selectedCollectionId
            };
        case actionTypes.DELETE_COLLECTION_REJECTED:
        case actionTypes.DELETE_COLLECTION_INVALIDATE:
            return {
                ...state,
                deletingCollection: false
            };
        case actionTypes.DELETE_FILE_FULFILLED:
            return deselectPath(state, action.meta.fullpath);
        case actionTypes.ADD_COLLECTION_PENDING:
            return {
                ...state,
                addingCollection: true
            };
        case actionTypes.ADD_COLLECTION_FULFILLED:
        case actionTypes.ADD_COLLECTION_REJECTED:
        case actionTypes.ADD_COLLECTION_INVALIDATE:
            return {
                ...state,
                addingCollection: false
            };
        case actionTypes.OPEN_INFODRAWER:
            return {
                ...state,
                infoDrawerOpened: true
            };
        case actionTypes.CLOSE_INFODRAWER:
            return {
                ...state,
                infoDrawerOpened: false
            };
        case actionTypes.OPEN_PATH:
            return {
                ...state,
                openedPath: action.path,
                selectedPaths: []
            };
        case actionTypes.CLOSE_PATH:
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
