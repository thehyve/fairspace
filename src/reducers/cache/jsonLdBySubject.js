import {promiseReducerFactory} from "../../utils/redux";
import reduceReducers from 'reduce-reducers';
import {METADATA, UPDATE_METADATA} from "../../actions/actionTypes";
import * as actionTypes from "../../utils/redux-action-types";

const defaultState = {};

const jsonLdFetchReducer = promiseReducerFactory(METADATA, defaultState, action => action.meta.subject);

const updateMetadataReducer = (state = defaultState, action) => {
    switch(action.type) {
        case actionTypes.fulfilled(UPDATE_METADATA):
            return {
                ...state,
                [action.meta.subject]: {
                    ...state[action.meta.subject],
                    invalidated: true
                }
            }
        default:
            return state
    }
}

export default reduceReducers(jsonLdFetchReducer, updateMetadataReducer, defaultState);
