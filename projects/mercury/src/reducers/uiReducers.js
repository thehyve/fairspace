import * as actionTypes from "../actions/actionTypes";

const defaultState = {
    pending: {}
};

const ui = (state = defaultState, action) => {
    switch (action.type) {
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
