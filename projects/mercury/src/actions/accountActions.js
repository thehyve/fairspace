import AccountAPI from '../services/AccountAPI';
import {createErrorHandlingPromiseAction} from "../utils/redux";
import {FETCH_AUTHORIZATIONS} from "./actionTypes";

export const fetchAuthorizations = createErrorHandlingPromiseAction(() => ({
    type: FETCH_AUTHORIZATIONS,
    payload: AccountAPI.getAuthorizations()
}));
