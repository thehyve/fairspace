import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import {
    ADD_COLLECTION, COLLECTIONS, DELETE_COLLECTION, UPDATE_COLLECTION
} from "../../actions/actionTypes";

const defaultState = {invalidated: true, data: []};

const fetchReducer = promiseReducerFactory(COLLECTIONS, defaultState);
const additionalReducer = (state = defaultState, action) => {
    switch (action.type) {
        case `${ADD_COLLECTION}_FULFILLED`:
        case `${DELETE_COLLECTION}_FULFILLED`:
            return {
                ...state,
                invalidated: true,
            };
        case `${UPDATE_COLLECTION}_FULFILLED`:
            return {
                ...state,
                invalidated: true,
                data: state.data.map((collection) => {
                    if (collection.id !== action.meta.id) {
                        return collection;
                    }
                    return {
                        ...collection,
                        name: action.meta.name,
                        description: action.meta.description
                    };
                })
            };
        default:
            return state;
    }
};

export default reduceReducers(fetchReducer, additionalReducer);
