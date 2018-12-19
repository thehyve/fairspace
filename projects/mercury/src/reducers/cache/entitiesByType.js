import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import {METADATA_ENTITIES, METADATA_NEW_ENTITY} from "../../actions/actionTypes";
import * as actionTypes from "../../utils/redux-action-types";

const metadataCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case actionTypes.fulfilled(METADATA_NEW_ENTITY):
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

export default reduceReducers(promiseReducerFactory(METADATA_ENTITIES, {}, action => action.meta.type), metadataCreateReducer);
