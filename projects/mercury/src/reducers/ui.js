import {TOGGLE_MENU} from "../actions/actionTypes";

const defaultState = { menuExpanded: true }

const ui = (state = defaultState, action) => {
    switch (action.type) {
        case TOGGLE_MENU:
            return {
                ...state,
                menuExpanded: !state.menuExpanded
            }
        default:
            return state;
    }
};

export default ui;
