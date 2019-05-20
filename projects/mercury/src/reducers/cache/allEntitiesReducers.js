import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";

const defaultState = {invalidated: true, data: []};

export const metadataCreateReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CREATE_METADATA_ENTITY_FULFILLED: {
            return {
                ...state,
                data: [],
                invalidated: true,
            };
        }
        default:
            return state;
    }
};

const fetchAllMetaEntitiesReducer = promiseReducerFactory(actionTypes.FETCH_ALL_METADATA_ENTITIES, defaultState);

export default reduceReducers(fetchAllMetaEntitiesReducer, metadataCreateReducer);
