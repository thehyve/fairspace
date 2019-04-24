import {getFirstPredicateValue} from "./linkeddata/jsonLdUtils";
import * as constants from "../constants";

const conditionApplisToAnyValue = (values, condition) => values && values.some(condition);

export const maxLengthValidation = (maxLength, values) => (conditionApplisToAnyValue(values, ({length}) => length > maxLength)
    ? `The maximum length is ${maxLength}` : null);

export const minCountValidation = (minCount, values) => ((!values || values.length < minCount)
    ? `The minimum number of values is ${minCount}` : null);

export const maxCountValidation = (maxCount, values) => ((values && values.length > maxCount)
    ? `The maximum number of values is ${maxCount}` : null);

export const validateValuesAgainstShape = ({shape, datatype, values}) => {
    const pureValues = values.map(v => v.value || v.id);
    const maxLength = getFirstPredicateValue(shape, constants.SHACL_MAX_LENGTH);
    const minCount = getFirstPredicateValue(shape, constants.SHACL_MIN_COUNT);
    const maxCount = getFirstPredicateValue(shape, constants.SHACL_MAX_COUNT);
    const errors = [];

    if (maxLength > 0 && datatype === constants.STRING_URI) {
        const validation = maxLengthValidation(maxLength, pureValues);
        if (validation) {
            errors.push(validation);
        }
    }

    if (minCount > 0) {
        const validation = minCountValidation(minCount, pureValues);
        if (validation) {
            errors.push(validation);
        }
    }

    if (maxCount > 0) {
        const validation = maxCountValidation(maxCount, pureValues);
        if (validation) {
            errors.push(validation);
        }
    }

    return errors;
};
