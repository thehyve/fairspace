import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";

const defaultState = {invalidated: true, data: []};

const fetchReducer = promiseReducerFactory(actionTypes.FETCH_COLLECTIONS, defaultState);

const additionalReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.ADD_COLLECTION_FULFILLED:
        case actionTypes.DELETE_COLLECTION_FULFILLED:
        case actionTypes.UPDATE_COLLECTION_FULFILLED:
            return {
                ...state,
                invalidated: true,
            };
        default:
            return state;
    }
};

export default reduceReducers(fetchReducer, additionalReducer);
