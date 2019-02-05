import * as actionTypes from "./actionTypes";

export const toggleMenuExpansion = () => ({
    type: actionTypes.TOGGLE_MENU
});

export const mouseEnteredMenu = () => ({
    type: actionTypes.MOUSE_ENTER_MENU
});

export const mouseLeftMenu = () => ({
    type: actionTypes.MOUSE_LEAVE_MENU
});
