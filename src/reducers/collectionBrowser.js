const defaultState = {
    selectedCollectionId: null,
    selectedPath: [],

    openedCollectionId: null,
    openedPath: null,

    infoDrawerOpened: false,
};

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
            return {
                ...state,
                selectedPath: (state.selectedPath || []).filter(el => el !== action.path)
            };

        case "DELETE_COLLECTION":
            return {
                ...state,
                selectedCollectionId: state.selectedCollectionId === action.collectionId ? null : state.selectedCollectionId
            }
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
