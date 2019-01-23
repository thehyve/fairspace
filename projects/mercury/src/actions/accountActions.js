import AccountAPI from '../services/AccountAPI';
import {createErrorHandlingPromiseAction} from "../utils/redux";
import {FETCH_AUTHORIZATIONS, FETCH_USER} from "./actionTypes";

export const fetchUser = createErrorHandlingPromiseAction(() => ({
    type: FETCH_USER,
    payload: AccountAPI.getUser()
}));

export const fetchAuthorizations = createErrorHandlingPromiseAction(() => ({
    type: FETCH_AUTHORIZATIONS,
    payload: AccountAPI.getAuthorizations()
}));
