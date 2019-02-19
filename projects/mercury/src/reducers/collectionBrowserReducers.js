import * as actionTypes from "../actions/actionTypes";

const defaultState = {
    selectedCollectionIRI: null,
    selectedPaths: [],
    openedCollectionId: null,
    openedPath: null,
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
                selectedCollectionIRI: action.collectionId
            };
        case actionTypes.SELECT_PATH:
            return {
                ...state,
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
                selectedCollectionIRI: state.selectedCollectionIRI === action.collectionId ? null : state.selectedCollectionIRI
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
