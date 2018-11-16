import {promiseReducerFactory} from "../../utils/redux";
import {METADATA_ALL_ENTITIES, METADATA_NEW_ENTITY} from "../../actions/actionTypes";
import reduceReducers from "reduce-reducers";
import * as actionTypes from "../../utils/redux-action-types";

const metadataCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case actionTypes.fulfilled(METADATA_NEW_ENTITY):
            return {
                ...state,
                data: state.data.concat([{'@id': action.meta.subject, '@type': [action.meta.type]}]),
                invalidated: true,
            };
        default:
            return state
    }
};

export default reduceReducers(promiseReducerFactory(METADATA_ALL_ENTITIES, null), metadataCreateReducer);
