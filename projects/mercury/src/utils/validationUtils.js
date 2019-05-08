import {getFirstPredicateValue} from "./linkeddata/jsonLdUtils";
import * as constants from "../constants";
import {getMaxCount} from "./linkeddata/vocabularyUtils";

// remove the string values that only contain whitespace
export const removeWhitespaceValues = (values) => (values ? values.filter(v => typeof v !== 'string' || v.trim().length > 0) : []);

export const maxLengthValidation = (maxLength, values) => (values && values.some(v => v.length > maxLength)
    ? `The maximum length is ${maxLength}` : null);

export const minCountValidation = (minCount, values) => {
    if (!values || values.length < minCount) {
        return minCount === 1 ? 'Please provide a value' : `The minimum number of values is ${minCount}`;
    }
    return null;
};

export const pushNonEmpty = (arr, value) => (value ? [...arr, value] : arr);

export const maxCountValidation = (maxCount, values) => ((values && values.length > maxCount)
    ? `The maximum number of values is ${maxCount}` : null);

export const validateValuesAgainstShape = ({shape, datatype, values}) => {
    // ignore falsy values (null, NaN, undefined or '') with the exception of zero and false
    const pureValues = values
        .map(v => v.id || v.value)
        .filter(v => Boolean(v) || v === 0 || v === false);

    const maxLength = getFirstPredicateValue(shape, constants.SHACL_MAX_LENGTH);
    const minCount = getFirstPredicateValue(shape, constants.SHACL_MIN_COUNT);
    const maxCount = getMaxCount(shape);
    let errors = [];

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
