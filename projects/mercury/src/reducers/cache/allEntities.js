import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_ALL_METADATA_ENTITIES, CREATE_METADATA_ENTITY} from "../../actions/actionTypes";
import * as actionTypes from "../../utils/redux-action-types";

const metadataCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case actionTypes.fulfilled(CREATE_METADATA_ENTITY):
            return {
                ...state,
                data: state.data.concat([{'@id': action.meta.subject, '@type': [action.meta.type]}]),
                invalidated: true,
            };
        default:
            return state;
    }
};

export default reduceReducers(promiseReducerFactory(FETCH_ALL_METADATA_ENTITIES, null), metadataCreateReducer);
