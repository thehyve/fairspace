import {ALTER_PERMISSION, TOGGLE_MENU} from "../actions/actionTypes";
import * as actionTypes from "../utils/redux-action-types";

const defaultState = {
    menuExpanded: true,
    pending: {}
}

const ui = (state = defaultState, action) => {
    switch (action.type) {
        case TOGGLE_MENU:
            return {
                ...state,
                menuExpanded: !state.menuExpanded
            }
        case actionTypes.pending(ALTER_PERMISSION):
            return {
                ...state,
                pending: {
                    ...state.pending,
                    alterPermission: true
                }
            }
        case actionTypes.fulfilled(ALTER_PERMISSION):
        case actionTypes.rejected(ALTER_PERMISSION):
            return {
                ...state,
                pending: {
                    ...state.pending,
                    alterPermission: false
                }
            }
        default:
            return state;
    }
};

export default ui;
