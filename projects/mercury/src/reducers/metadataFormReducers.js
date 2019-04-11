import reduceReducers from "reduce-reducers";
import * as actionTypes from "../actions/actionTypes";
import {createByKey} from "../utils/redux";

/**
 * The updates map contains a map from propertyKey (predicate) to a list of values for that property
 * @type {{updates: {}}}
 */
const initialState = {updates: {}, pending: false, error: false};

/**
 * Returns the values that are present in the form for the given propertyKey
 * @param state
 * @param propertyKey
 * @returns {*|string}
 */
const getValues = (state, action) => state.updates[action.property.key] || action.property.values;

const generateStateWithNewValues = (state, propertyKey, updatedValues) => ({
    ...state,
    updates: {
        ...state.updates,
        [propertyKey]: updatedValues
    }
});

/**
 * Reducers the state for the metadata form, for a single subject
 *
 * @param state
 * @param action
 * @returns {*}
 */
export const metadataFormChangesReducerPerSubject = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.INITIALIZE_METADATA_FORM:
        case actionTypes.CLEAR_METADATA_FORM:
            return initialState;
        case actionTypes.ADD_METADATA_VALUE:
            return generateStateWithNewValues(
                state,
                action.property.key,
                [...getValues(state, action), action.value]
            );
        case actionTypes.UPDATE_METADATA_VALUE:
            return generateStateWithNewValues(
                state,
                action.property.key,
                getValues(state, action).map((el, idx) => ((idx === action.index) ? action.value : el))
            );
        case actionTypes.DELETE_METADATA_VALUE:
            return generateStateWithNewValues(
                state,
                action.property.key,
                getValues(state, action).filter((el, idx) => idx !== action.index)
            );
        default:
            return state;
    }
};

/**
 * Reducers the state for the metadata form submissions, for a single subject
 *
 * @param state
 * @param action
 * @returns {*}
 */
export const metadataFormSubmissionReducerPerSubject = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_METADATA_PENDING:
        case actionTypes.UPDATE_VOCABULARY_PENDING:
            return {
                ...state,
                error: false,
                pending: true
            };
        case actionTypes.UPDATE_METADATA_FULFILLED:
        case actionTypes.UPDATE_VOCABULARY_FULFILLED:
            return {
                ...state,
                updates: {},
                pending: false
            };
        case actionTypes.UPDATE_METADATA_REJECTED:
        case actionTypes.UPDATE_VOCABULARY_REJECTED:
            return {
                ...state,
                error: true,
                pending: false
            };
        default:
            return state;
    }
};

// We need two different reducers, as the normal actions have the subject
// in the action.subject property, whereas the promise actions have the subject
// in action.meta.subject due to implementation details
export default reduceReducers(
    createByKey(
        action => action && action.subject,
        action => action.subject
    )(metadataFormChangesReducerPerSubject),
    createByKey(
        action => action && action.meta && action.meta.subject,
        action => action.meta.subject
    )(metadataFormSubmissionReducerPerSubject)
);


export const getMetadataFormUpdates = (state, subject) => (state.metadataForm[subject] && state.metadataForm[subject].updates) || {};
export const hasMetadataFormUpdates = (state, subject) => !!(state.metadataForm[subject] && state.metadataForm[subject].updates && Object.keys(state.metadataForm[subject].updates).length > 0);
