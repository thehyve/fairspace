import reduceReducers from 'reduce-reducers';
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";

const defaultState = {};

const jsonLdFetchReducer = promiseReducerFactory(actionTypes.FETCH_METADATA, defaultState, action => action.meta.subject);

const updateMetadataReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_METADATA_FULFILLED:
            return {
                ...state,
                [action.meta.subject]: {
                    ...state[action.meta.subject],
                    invalidated: true
                }
            };
        default:
            return state;
    }
};

export default reduceReducers(jsonLdFetchReducer, updateMetadataReducer, defaultState);
