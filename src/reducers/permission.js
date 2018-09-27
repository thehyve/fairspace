import {
    PERMISSIONS_FULFILLED,
    PERMISSIONS_PENDING,
    PERMISSIONS_REJECTED
} from "../actions/actionTypes";

const defaultState = {
    pending: false,
    error: false,
    items: [],
    showPermissionDialog: false,
    showConfirmDeleteDialog: false
};

const permissions = (state = defaultState, action) => {
    switch (action.type) {
        case PERMISSIONS_PENDING:
            return {
                ...state,
                pending: true,
                error: false
            };
        case PERMISSIONS_FULFILLED:
            return {
                ...state,
                pending: false,
                items: action.payload
            };
        case PERMISSIONS_REJECTED:
            return {
                ...state,
                pending: false,
                error: action.payload || true
            };
        default:
            return state;
    }
};

export default permissions;
