import {useState} from "react";
import {validateValuesAgainstShape} from "../../utils/validationUtils";

export const hasValidationError = errors => errors && Array.isArray(errors) && errors.length > 0;

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
