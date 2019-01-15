import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../utils/redux";
import {COMBINE_METADATA, CREATE_METADATA_ENTITY, UPDATE_METADATA} from "../actions/actionTypes";
import * as actionTypes from "../utils/redux-action-types";
import {TYPE_URI} from "../services/MetadataAPI/MetadataAPI";

const defaultState = {
    creatingMetadataEntity: false
};
const metadataCombinationReducer = promiseReducerFactory(COMBINE_METADATA, defaultState, action => action.meta.subject);
const metadataUpdateReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.fulfilled(UPDATE_METADATA):
            return {
                ...state,
                [action.meta.subject]: {
                    ...state[action.meta.subject],
                    data: state[action.meta.subject].data.map(el => ((el.key === action.meta.predicate) ? {...el, values: action.meta.values} : el)),
                    invalidated: true
                }
            };
        case actionTypes.pending(CREATE_METADATA_ENTITY):
            return {
                ...state,
                creatingMetadataEntity: true
            };
        case actionTypes.fulfilled(CREATE_METADATA_ENTITY):
            return {
                ...state,
                creatingMetadataEntity: false,
                [action.meta.subject]: {
                    data: [{key: TYPE_URI, values: [{id: action.meta.type}]}],
                    invalidated: true
                }
            };
        case actionTypes.rejected(CREATE_METADATA_ENTITY):
            return {
                ...state,
                creatingMetadataEntity: false
            };
        default:
            return state;
    }
};

export default reduceReducers(metadataCombinationReducer, metadataUpdateReducer, defaultState);
