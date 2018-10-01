const defaultState = {
    selectedCollectionId: null,
    selectedPath: [],

    openedCollectionId: null,
    openedPath: null,

    infoDrawerOpened: false,
};

const deselectPath = (state, path) => {
    return {
        ...state,
        selectedPath: (state.selectedPath || []).filter(el => el !== path)
    };
}

const collectionBrowser = (state = defaultState, action) => {
    switch (action.type) {
        case "SELECT_COLLECTION":
            return {
                ...state,
                infoDrawerOpened: true,
                selectedCollectionId: action.collectionId
            };
        case "DESELECT_COLLECTION":
            return {
                ...state,
                infoDrawerOpened: false,
                selectedCollectionId: null
            };
        case "SELECT_PATH":
            return {
                ...state,
                infoDrawerOpened: true,
                selectedPath: (state.selectedPath || []).concat(action.path)
            };
        case "DESELECT_PATH":
            return deselectPath(state, action.path);
        case "DELETE_COLLECTION_FULFILLED":
            return {
                ...state,
                selectedCollectionId: state.selectedCollectionId === action.collectionId ? null : state.selectedCollectionId
            }
        case "DELETE_FILE_FULFILLED":
            return deselectPath(state, action.meta.fullpath);
        case "OPEN_INFODRAWER":
            return {
                ...state,
                infoDrawerOpened: true
            };
        case "CLOSE_INFODRAWER":
            return {
                ...state,
                infoDrawerOpened: false
            };
        default:
            return state;
    }
};

export default collectionBrowser;
