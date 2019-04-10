import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";

const vocabularyCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case actionTypes.CREATE_VOCABULARY_ENTITY_FULFILLED:
            return {
                ...state,
                [action.meta.type]: {
                    ...state[action.meta.type],
                    invalidated: true
                }
            };
        default:
            return state;
    }
};

export default reduceReducers(
    promiseReducerFactory(actionTypes.FETCH_VOCABULARY_ENTITIES, {}, action => action.meta.type),
    vocabularyCreateReducer
);
