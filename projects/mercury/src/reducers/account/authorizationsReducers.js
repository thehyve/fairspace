import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_AUTHORIZATIONS} from "../../actions/actionTypes";

const defaultState = {invalidated: true, data: []};

export default promiseReducerFactory(FETCH_AUTHORIZATIONS, defaultState);

export const getAuthorizations = ({account: {authorizations}}) => authorizations.data;
export const isAuthorizationsPending = ({account: {authorizations}}) => authorizations.pending;
export const hasAuthorizationsError = ({account: {authorizations}}) => authorizations.error;
