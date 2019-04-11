import * as actionTypes from "../actions/actionTypes";
import {createByKey} from "../utils/redux";

/**
 * The updates map contains a map from propertyKey (predicate) to a list of values for that property
 * @type {{updates: {}}}
 */
const initialState = {updates: {}};

/**
 * Returns the values that are present in the form for the given propertyKey
 * @param state
 * @param propertyKey
 * @returns {*|string}
 */
const getValues = (state, action) => {
    return state.updates[action.property.key] || action.property.values;
}

const generateStateWithNewValues = (state, propertyKey, updatedValues) => ({
    ...state,
    updates: {
        ...state.updates,
        [propertyKey]: updatedValues
    }
})

/**
 * Reducers the state for the metadata form, for a single subject
 *
 * @param state
 * @param action
 * @returns {*}
 */
export const metadataFormReducerPerSubject = (state = initialState, action) => {
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
        case actionTypes.SUBMIT_METADATA_FORM:
        default:
            return state;
    }
};

export default createByKey(
    action => action && action.subject,
    action => action.subject
)(metadataFormReducerPerSubject);


export const getMetadataFormUpdates = (state, subject) => (state.metadataForm[subject] && state.metadataForm[subject].updates) || {};
