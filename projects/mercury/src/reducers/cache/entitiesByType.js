import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_METADATA_ENTITIES, CREATE_METADATA_ENTITY} from "../../actions/actionTypes";
import * as actionTypes from "../../utils/redux-action-types";

const metadataCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case actionTypes.fulfilled(CREATE_METADATA_ENTITY):
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

export default reduceReducers(promiseReducerFactory(FETCH_METADATA_ENTITIES, {}, action => action.meta.type), metadataCreateReducer);
