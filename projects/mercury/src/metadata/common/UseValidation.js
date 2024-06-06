import {useState} from 'react';
import {validateValuesAgainstShape} from './validationUtils';

export const hasValidationError = errors => errors && Array.isArray(errors) && errors.length > 0;

/**
 * This hook keeps track of validation errors for a form. It contains a method to
 * validate a property value against its shape. If the value does not validate, an error is
 * stored within this hooks state.
 *
 * @returns {{validateProperty: (function(*, *=): boolean), allErrors: {}, isValid: boolean}}
 */
const useValidation = () => {
    const [errors, setErrors] = useState({});

    const validateProperty = (property, newValue) => {
        const propertyErrors = validateValuesAgainstShape({
            shape: property.shape,
            datatype: property.datatype,
            isGenericIriResource: property.isGenericIriResource,
            values: newValue
        });

        setErrors(currentErrors => ({
            ...currentErrors,
            [property.key]: propertyErrors
        }));

        return propertyErrors.length > 0;
    };

    return {
        validateProperty,

        validationErrors: errors,
        isValid: !Object.values(errors).find(hasValidationError)
    };
};

export default useValidation;
