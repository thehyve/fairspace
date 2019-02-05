import * as actionTypes from "./actionTypes";

export const toggleMenuExpansion = () => ({
    type: actionTypes.TOGGLE_MENU
});

export const mouseEnterMenu = () => ({
    type: actionTypes.MOUSE_ENTER_MENU
});

export const mouseLeaveMenu = () => ({
    type: actionTypes.MOUSE_LEAVE_MENU
});
