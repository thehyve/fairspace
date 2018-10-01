import {promiseReducerFactory} from "../../utils/redux";
import reduceReducers from "reduce-reducers";

const defaultState = {invalidated: true, data: []};

const fetchReducer = promiseReducerFactory("COLLECTIONS", defaultState)
const additionalReducer = (state = defaultState, action) => {
    switch (action.type) {
        case "ADD_COLLECTION_FULFILLED":
        case "DELETE_COLLECTION_FULFILLED":
            return {
                ...state,
                invalidated: true,
            };
        case "UPDATE_COLLECTION_FULFILLED":
            return {
                ...state,
                invalidated: true,
                    data: state.data.map(collection => {
                    if(collection.id !== action.meta.id) {
                        return collection
                    } else {
                        return {
                            ...collection,
                            name: action.meta.name,
                            description: action.meta.description
                        }
                    }
                })
            }
        default:
            return state;
    }
};

export default reduceReducers(fetchReducer, additionalReducer);
