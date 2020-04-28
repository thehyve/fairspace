import {useState} from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import useValidation from "./UseValidation";
import {first} from "../../common/utils";
import {DECIMAL_URI, INTEGER_URI, LONG_URI, MARKDOWN_URI, STRING_URI} from "../../constants";

const DEFAULTABLE_DATATYPES = [STRING_URI, INTEGER_URI, DECIMAL_URI, LONG_URI, MARKDOWN_URI];

const populateDefaultFormValues = (initialProperties, values, setFormValues) => {
    // Values of some properties have to be set to empty strings
    // not to dynamically add single-value fields when these values are updated.
    initialProperties.forEach(p => {
        const defaultValue = [{value: ""}];
        const newValues = !values[p.key] && p.maxValuesCount === 1 && DEFAULTABLE_DATATYPES.includes(p.datatype)
            ? defaultValue : values[p.key];
        setFormValues(prev => ({
            ...prev,
            [p.key]: newValues
        }));
    });
};

/**
 * This hook is concerned about storing form state. It is given an initial set of values
 * and stores a separate list with updates to those values.
 *
 * Updates to the values are validated using the {useValidation} hook. The methods and data from
 * that hook are exposed as well.
 *
 * @param values
 * @param initialProperties
 * @returns {{valuesWithUpdates: any, updateValue: updateValue, hasFormUpdates: any, deleteValue: deleteValue, updates: any, addValue: addValue}}
 * @see {useValidation}
 */
const useFormData = (values, initialProperties = []) => {
    const [updates, setUpdates] = useState({});
    const {validateProperty, validationErrors, isValid} = useValidation();
    const [initialFormValues, setInitialFormValues] = useState(values);

    const resetUpdates = () => setUpdates({});

    useDeepCompareEffect(() => {
        populateDefaultFormValues(initialProperties, values, setInitialFormValues);
        resetUpdates();
    }, [initialProperties, values]);

    const hasFormUpdates = Object.keys(updates).length > 0;
    const valuesWithUpdates = {...initialFormValues, ...updates};

    let updatesToReturn = updates;

    const save = (property, newValue) => {
        // Store a separate list of current updates apart from the state. This enables
        // submission of the updates before the form is re-rendered.
        updatesToReturn = {
            ...updates,
            [property.key]: newValue
        };

        setUpdates(prev => ({
            ...prev,
            [property.key]: newValue
        }));
        validateProperty(property, newValue);
    };

    const current = key => valuesWithUpdates[key] || [];

    const addValue = (property, value) => {
        const newValue = [...current(property.key), value];
        save(property, newValue);
    };

    const deleteUpdate = (propertyKey) => {
        const newUpdates = {...updates};
        delete newUpdates[propertyKey];
        setUpdates(newUpdates);
    };

    const updateValue = (property, value, index) => {
        if (!first(initialFormValues[property.key]) || first(initialFormValues[property.key]).value !== value.value) {
            const newValue = current(property.key).map((el, idx) => ((idx === index) ? value : el));
            save(property, newValue);
        } else if (updates[property.key]) {
            deleteUpdate(property.key);
        }
    };

    const deleteValue = (property, index) => {
        if (property.maxValuesCount === 1) {
            if (DEFAULTABLE_DATATYPES.includes(property.datatype)) {
                updateValue(property, {value: ""}, index);
            } else {
                deleteUpdate(property.key);
            }
        } else {
            const newValue = current(property.key).filter((el, idx) => idx !== index);
            save(property, newValue);
        }
    };

    const clearForm = () => setUpdates({});

    const validateAll = properties => !!properties.map(p => validateProperty(p, current(p.key))).find(v => v);

    // Check if value is newly added and the form with this update is not submitted yet.
    const checkValueAddedNotSubmitted = (property, value) => {
        if (!initialFormValues || !initialFormValues[property.key]) {
            return true;
        }
        if (property.maxValuesCount === 1) {
            return !initialFormValues[property.key].find(iv => iv.value === value.value);
        }
        return !initialFormValues[property.key].find(iv => iv === value);
    };

    return {
        addValue,
        updateValue,
        deleteValue,
        clearForm,

        hasFormUpdates,
        getUpdates: () => updatesToReturn,
        updates,
        valuesWithUpdates,
        checkValueAddedNotSubmitted,

        validateAll,
        validateProperty,
        validationErrors,
        isValid
    };
};

export default useFormData;
