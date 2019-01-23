import * as actionTypes from "../actions/actionTypes";

const defaultState = {
    menuExpanded: true,
    pending: {}
};

const ui = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.TOGGLE_MENU:
            return {
                ...state,
                menuExpanded: !state.menuExpanded
            };
        case actionTypes.ALTER_PERMISSION_PENDING:
            return {
                ...state,
                pending: {
                    ...state.pending,
                    alterPermission: true
                }
            };
        case actionTypes.ALTER_PERMISSION_FULFILLED:
        case actionTypes.ALTER_PERMISSION_REJECTED:
            return {
                ...state,
                pending: {
                    ...state.pending,
                    alterPermission: false
                }
            };
        default:
            return state;
    }
};

export default ui;
