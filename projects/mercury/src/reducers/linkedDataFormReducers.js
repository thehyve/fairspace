import reduceReducers from "reduce-reducers";

import * as actionTypes from "../actions/actionTypes";
import {createByKey} from "../utils/redux";

/**
 * The updates map contains a map from propertyKey (predicate) to a list of values for that property
 * The validations map contains a map from propertyKey (predicate) to the list of errors of the property change
 * @type {{updates: {}, validations: {}}}
 */
const initialState = {
    updates: {},
    validations: {},
    pending: false,
    error: false
};

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
 * Reducers the state for the metadata form, for a single formKey
 *
 * @param state
 * @param action
 * @returns {*}
 */
export const linkedDataFormChangesReducerPerForm = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.INITIALIZE_LINKEDDATA_FORM:
        case actionTypes.CLEAR_LINKEDDATA_FORM:
            return initialState;
        case actionTypes.ADD_LINKEDDATA_VALUE:
            return generateStateWithNewValues(
                state,
                action.property.key,
                [...getValues(state, action), action.value]
            );
        case actionTypes.UPDATE_LINKEDDATA_VALUE:
            return generateStateWithNewValues(
                state,
                action.property.key,
                getValues(state, action).map((el, idx) => ((idx === action.index) ? action.value : el))
            );
        case actionTypes.DELETE_LINKEDDATA_VALUE:
            return generateStateWithNewValues(
                state,
                action.property.key,
                getValues(state, action).filter((el, idx) => idx !== action.index)
            );
        case actionTypes.VALIDATE_LINKEDDATA_PROPERTY:
            return {
                ...state,
                validations: {
                    ...state.validations,
                    [action.property.key]: [...action.validations]
                }
            };
        default:
            return state;
    }
};


// We need two different reducers, as the normal actions have the formKey
// in the action.formKey property, whereas the promise actions have the formKey
// in action.meta.formKey due to implementation details
export default reduceReducers(
    createByKey(
        action => action && action.formKey,
        action => action.formKey
    )(linkedDataFormChangesReducerPerForm),
);


export const getLinkedDataFormUpdates = (state, formKey) => (state.linkedDataForm[formKey] && state.linkedDataForm[formKey].updates) || {};

export const hasLinkedDataFormUpdates = (state, formKey) => !!(Object.keys(getLinkedDataFormUpdates(state, formKey)).length > 0);

export const isLinkedDataFormPending = (state, formKey) => state.linkedDataForm[formKey] && state.linkedDataForm[formKey].pending;

export const getLinkedDataFormValidations = (state, formKey) => (state.linkedDataForm[formKey] && state.linkedDataForm[formKey].validations) || {};

export const hasLinkedDataFormValidationErrors = (state, formKey) => !!Object.values(getLinkedDataFormValidations(state, formKey)).find(v => v.length > 0);
