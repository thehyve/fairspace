import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";

const metadataCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case actionTypes.CREATE_METADATA_ENTITY_FULFILLED:
            return {
                ...state,
                data: state.data.concat([{'@id': action.meta.subject, '@type': [action.meta.type]}]),
                invalidated: true,
            };
        default:
            return state;
    }
};

export default reduceReducers(promiseReducerFactory(actionTypes.FETCH_ALL_METADATA_ENTITIES, null), metadataCreateReducer);
