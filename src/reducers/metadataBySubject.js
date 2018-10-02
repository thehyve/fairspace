import {promiseReducerFactory} from "../utils/redux";
import reduceReducers from "reduce-reducers";
import {METADATA_COMBINATION, UPDATE_METADATA} from "../actions/actionTypes";
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
                    data: state[action.meta.subject].data.map(el => {
                        if(el.key !== action.meta.predicate) {
                            return el;
                        }

                        return {
                            ...el,
                            values: action.meta.values
                        }
                    }),
                    invalidated: true
                }
            }
        default:
            return state
    }
}

export default reduceReducers(metadataCombinationReducer, metadataUpdateReducer, defaultState);
