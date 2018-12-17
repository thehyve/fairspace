import {TOGGLE_MENU} from "../actions/actionTypes";

export const LOCAL_STORAGE_MENU_KEY = 'FAIRSPACE_MENU_EXPANDED';

export default store => next => (action) => {
    const result = next(action);

    // Store menu expansion state in local storage
    if (action.type === TOGGLE_MENU) {
        window.localStorage.setItem(LOCAL_STORAGE_MENU_KEY, store.getState().ui.menuExpanded);
    }

    return result;
};
