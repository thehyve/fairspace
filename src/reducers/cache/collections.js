import {promiseReducerFactory} from "../../utils/redux";
import reduceReducers from "reduce-reducers";

const defaultState = {invalidated: true, items: []};

const fetchReducer = promiseReducerFactory("COLLECTIONS", defaultState)
const additionalReducer = (state = defaultState, action) => {
    switch (action.type) {
        case "ADD_COLLECTION":
        case "UPDATE_COLLECTION":
        case "DELETE_COLLECTION":
            return {
                ...state,
                invalidated: true,
            };
        default:
            return state;
    }
};

export default reduceReducers(fetchReducer, additionalReducer);
