import {getFirstPredicateValue} from "./linkeddata/jsonLdUtils";
import * as constants from "../constants";
import {getMaxCount} from "./linkeddata/vocabularyUtils";

// remove the string values that only contain whitespace
export const removeWhitespaceValues = (values) => (values ? values.filter(v => typeof v !== 'string' || v.trim().length > 0) : []);

export const maxLengthValidation = (maxLength, values) => (values && values.some(v => v.length > maxLength)
    ? `Please provide no more than ${maxLength} characters` : null);

export const minCountValidation = (minCount, values) => {
    if (!values || values.length < minCount) {
        return minCount === 1 ? 'Please provide a value' : `Please specify at least ${minCount} values`;
    }
    return null;
};

export const iriValidation = (values) => {
    try {
        if (values && values.length > 0) {
            values.forEach(v => {
                if (v) {
                    // eslint-disable-next-line no-new
                    new URL(v);
                }
            });
        }
    } catch (e) {
        return 'Please provide a valid URI';
    }
    return null;
};

export const pushNonEmpty = (arr, value) => (value ? [...arr, value] : arr);

export const maxCountValidation = (maxCount, values) => ((values && values.length > maxCount)
    ? `Please provide no more than ${maxCount} values` : null);

export const validateValuesAgainstShape = ({shape, datatype, values, isGenericIriResource}) => {
    // ignore falsy values (null, NaN, undefined or '') with the exception of zero and false
    const pureValues = values
        .map(v => v.id || v.value)
        .filter(v => Boolean(v) || v === 0 || v === false);

    const maxLength = getFirstPredicateValue(shape, constants.SHACL_MAX_LENGTH);
    const minCount = getFirstPredicateValue(shape, constants.SHACL_MIN_COUNT);
    const maxCount = getMaxCount(shape);
    let errors = [];

    // this error is enough and more specific than other errors, return it by itself
    if (isGenericIriResource) {
        const validation = iriValidation(pureValues);
        if (validation) {
            return [validation];
        }
    }

    if (maxLength > 0 && datatype === constants.STRING_URI) {
        const validation = maxLengthValidation(maxLength, pureValues);
        errors = pushNonEmpty(errors, validation);
    }

    if (minCount > 0) {
        const validation = minCountValidation(minCount, removeWhitespaceValues(pureValues));
        errors = pushNonEmpty(errors, validation);
    }

    if (maxCount > 0) {
        const validation = maxCountValidation(maxCount, removeWhitespaceValues(pureValues));
        errors = pushNonEmpty(errors, validation);
    }

    return errors;
};
