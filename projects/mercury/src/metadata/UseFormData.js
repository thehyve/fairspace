import {useState} from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import useValidation from "./UseValidation";
import {first} from "../common/utils";
import {DECIMAL_URI, INTEGER_URI, LONG_URI, MARKDOWN_URI, STRING_URI} from "../constants";

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
    const [formValues, setFormValues] = useState({...values});

    useDeepCompareEffect(() => {
        populateDefaultFormValues(initialProperties, values, setFormValues);
    }, [initialProperties, values]);

    const hasFormUpdates = Object.keys(updates).length > 0;
    const valuesWithUpdates = {...formValues, ...updates};

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
        if (!first(formValues[property.key]) || first(formValues[property.key]).value !== value.value) {
            const newValue = current(property.key).map((el, idx) => ((idx === index) ? value : el));
            save(property, newValue);
        } else if (updates[property.key]) {
            deleteUpdate(property.key);
        }
    };

    const deleteValue = (property, index) => {
        if (property.maxValuesCount === 1) {
            updateValue(property, {value: ''}, index);
        } else {
            const newValue = current(property.key).filter((el, idx) => idx !== index);
            save(property, newValue);
        }
    };

    const clearForm = () => setUpdates({});

    const validateAll = properties => !!properties.map(p => validateProperty(p, current(p.key))).find(v => v);

    return {
        addValue,
        updateValue,
        deleteValue,
        clearForm,

        hasFormUpdates,
        getUpdates: () => updatesToReturn,
        updates,
        valuesWithUpdates,

        validateAll,
        validateProperty,
        validationErrors,
        isValid
    };
};

export default useFormData;
