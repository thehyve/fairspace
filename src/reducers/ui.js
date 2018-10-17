import {TOGGLE_MENU} from "../actions/actionTypes";

const LOCAL_STORAGE_MENU_KEY = 'FAIRSPACE_MENU_EXPANDED';

// Set the default value based on the value from local storage
// Localstorage stores values as strings. As the default is true
// we only check whether the value is explicitly set to 'false'
const localStorageValue = window.localStorage.getItem(LOCAL_STORAGE_MENU_KEY);
const defaultState = {
    menuExpanded: localStorageValue === 'false' ? false : true
};

const ui = (state = defaultState, action) => {
    switch (action.type) {
        case TOGGLE_MENU:
            // Store information in local storage
            const newMenuExpandedState = !state.menuExpanded;
            window.localStorage.setItem(LOCAL_STORAGE_MENU_KEY, newMenuExpandedState);

            return {
                ...state,
                menuExpanded: newMenuExpandedState
            }
        default:
            return state;
    }
};

export default ui;
