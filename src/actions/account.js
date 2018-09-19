import AccountAPI from '../services/AccountAPI/AccountAPI'
import {createPromiseAction} from "../utils/redux";

export const fetchUser = createPromiseAction(() => ({
    type: "USER",
    payload: AccountAPI.getUser()
}));

export const fetchAuthorizations = createPromiseAction(() => ({
    type: "AUTHORIZATIONS",
    payload: AccountAPI.getAuthorizations()
}));
