import {useState} from "react";
import useValidation from "./UseValidation";
import {first} from "../common/utils";

/**
 * This hook is concerned about storing form state. It is given an initial set of values
 * and stores a separate list with updates to those values.
 *
 * Updates to the values are validated using the {useValidation} hook. The methods and data from
 * that hook are exposed as well.
 *
 * @param values
 * @returns {{valuesWithUpdates: any, updateValue: updateValue, hasFormUpdates: any, deleteValue: deleteValue, updates: any, addValue: addValue}}
 * @see {useValidation}
 */
const useFormData = (values) => {
    const [updates, setUpdates] = useState({});
    const {validateProperty, validationErrors, isValid} = useValidation();

    const hasFormUpdates = Object.keys(updates).length > 0;
    const valuesWithUpdates = {...values, ...updates};

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

    const deleteValue = (property, index) => {
        const newValue = current(property.key).filter((el, idx) => idx !== index);
        save(property, newValue);
    };

    const deleteUpdate = (propertyKey) => {
        const newUpdates = {...updates};
        delete newUpdates[propertyKey];
        setUpdates(newUpdates);
    };

    const updateValue = (property, value, index) => {
        if (!first(values[property.key]) || first(values[property.key]).value !== value.value) {
            const newValue = current(property.key).map((el, idx) => ((idx === index) ? value : el));
            save(property, newValue);
        } else if (updates[property.key]) {
            deleteUpdate(property.key);
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
