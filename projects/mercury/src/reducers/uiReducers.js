import * as actionTypes from "../actions/actionTypes";

const defaultState = {
    menuExpanded: true,
    mouseEnteredMenu: false,
    pending: {}
};

const ui = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.TOGGLE_MENU:
            return {
                ...state,
                menuExpanded: !state.menuExpanded
            };
        case actionTypes.MOUSE_ENTER_MENU:
            return {
                ...state,
                mouseEnteredMenu: true
            };
        case actionTypes.MOUSE_LEAVE_MENU:
            return {
                ...state,
                mouseEnteredMenu: false
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

        case actionTypes.FETCH_USERS + "_REJECTED":
        case actionTypes.FETCH_AUTHORIZATIONS + "_REJECTED":
        case actionTypes.FETCH_WORKSPACE + "_REJECTED":
            // If a call has failed with a 401 status, the user
            // will be redirected to the login page. During the redirect
            // the user should see a waiting spinner
            if (action.payload && action.payload.redirecting) {
                return {
                    ...state,
                    pending: {
                        ...state.pending,
                        loginRedirect: true
                    }
                };
            }

            return state;
        default:
            return state;
    }
};

export default ui;

export const isRedirectingForLogin = ({ui: {pending: {loginRedirect = false}}}) => loginRedirect;
