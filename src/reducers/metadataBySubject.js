import {promiseReducerFactory} from "../utils/redux";
import reduceReducers from "reduce-reducers";
import {METADATA_COMBINATION, METADATA_NEW_ENTITY, UPDATE_METADATA} from "../actions/actionTypes";
import * as actionTypes from "../utils/redux-action-types";

const defaultState = {};
const metadataCombinationReducer = promiseReducerFactory(METADATA_COMBINATION, defaultState, action => action.meta.subject);
const metadataUpdateReducer = (state = defaultState, action) => {
    switch(action.type) {
        case actionTypes.fulfilled(UPDATE_METADATA):
            return {
                ...state,
                [action.meta.subject]: {
                    ...state[action.meta.subject],
                    data: (state[action.meta.subject] || {data: []}).data
                        .filter(el => el.key !== action.meta.predicate)
                        .concat([{key: action.meta.predicate, values: action.meta.values}]),
                    invalidated: true
                }
            };
        case actionTypes.fulfilled(METADATA_NEW_ENTITY):
            return {
                ...state,
                [action.meta.subject]: {
                    data: [{key: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', values: [{id: action.meta.type}]}],
                    invalidated: true
                }
            };
        default:
            return state
    }
}

export default reduceReducers(metadataCombinationReducer, metadataUpdateReducer, defaultState);
