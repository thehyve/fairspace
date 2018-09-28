import {createFetchPromiseReducer} from "../../utils/redux";
import reduceReducers from 'reduce-reducers';

const defaultState = {};

const jsonLdFetchReducer = createFetchPromiseReducer("METADATA", defaultState, action => action.meta.subject);

const updateMetadataReducer = (state = defaultState, action) => {
    switch(action.type) {
        case "UPDATE_METADATA_FULFILLED":
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
