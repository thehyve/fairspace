import {SHOW_CONFIRM_DELETE_DIALOG, SHOW_PERMISSION_DIALOG} from "../actions/actionTypes";

const defaultState = {
    pending: false,
    error: false,
    items: [],
    showPermissionDialog:false,
    showConfirmDeleteDialog:false
};

const permissions = (state = defaultState, action) => {
    console.log('action', action);
    switch (action.type) {
        case SHOW_PERMISSION_DIALOG:
            return {
                ...state,
                showPermissionDialog: !state.showPermissionDialog
            };
        case SHOW_CONFIRM_DELETE_DIALOG:
            return {
                ...state,
                showConfirmDeleteDialog: !state.showConfirmDeleteDialog
            };
        case "PERMISSIONS_PENDING":
            return {
                ...state,
                pending: true,
                error: false
            };
        case "PERMISSIONS_FULFILLED":
            return {
                ...state,
                pending: false,
                items: action.payload
            };
        case "PERMISSIONS_REJECTED":
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
