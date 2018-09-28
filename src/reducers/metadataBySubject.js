import {createFetchPromiseReducer} from "../utils/redux";
import reduceReducers from "reduce-reducers";

const defaultState = {};
const metadataCombinationReducer = createFetchPromiseReducer("METADATA_COMBINATION", defaultState, action => action.meta.subject);
const metadataUpdateReducer = (state = defaultState, action) => {
    switch(action.type) {
        case "UPDATE_METADATA_FULFILLED":
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
