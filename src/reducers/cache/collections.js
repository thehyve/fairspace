import {promiseReducerFactory} from "../../utils/redux";
import reduceReducers from "reduce-reducers";

const defaultState = {invalidated: true, data: []};

const fetchReducer = promiseReducerFactory("COLLECTIONS", defaultState)
const additionalReducer = (state = defaultState, action) => {
    switch (action.type) {
        case "ADD_COLLECTION_FULFILLED":
        case "UPDATE_COLLECTION_FULFILLED":
        case "DELETE_COLLECTION_FULFILLED":
            return {
                ...state,
                invalidated: true,
            };
        default:
            return state;
    }
};

export default reduceReducers(fetchReducer, additionalReducer);
