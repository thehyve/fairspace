import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";

const defaultState = {invalidated: true, data: []};

const fetchReducer = promiseReducerFactory(actionTypes.FETCH_COLLECTIONS, defaultState);

const additionalReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.ADD_COLLECTION_FULFILLED:
        case actionTypes.DELETE_COLLECTION_FULFILLED:
            return {
                ...state,
                invalidated: true,
            };
        case actionTypes.UPDATE_COLLECTION_FULFILLED:
            return {
                ...state,
                invalidated: true,
                data: state.data.map((collection) => {
                    if (collection.iri !== action.meta.id) {
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
