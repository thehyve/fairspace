import {useState} from "react";
import useValidation from "./useValidation";

/**
 * This hook is concerned about storing form state for linked data
 * @param values
 * @returns {{valuesWithUpdates: any, updateValue: updateValue, hasFormUpdates: any, deleteValue: deleteValue, updates: any, addValue: addValue}}
 */
const useFormData = (values) => {
    const [updates, setUpdates] = useState({});

    const validation = useValidation();

    const hasFormUpdates = Object.keys(updates).length > 0;
    const valuesWithUpdates = {...values, ...updates};

    const save = (property, newValue) => {
        setUpdates({
            ...updates,
            [property.key]: newValue
        });
        validation.validateProperty(property, newValue);
    };

    const current = key => valuesWithUpdates[key] || [];

    const addValue = (property, value) => {
        const newValue = [...current(property.key), value];
        save(property, newValue);
    };

    const updateValue = (property, value, index) => {
        const newValue = current(property.key).map((el, idx) => ((idx === index) ? value : el));
        save(property, newValue);
    };

    const deleteValue = (property, index) => {
        const newValue = current(property.key).filter((el, idx) => idx !== index);
        save(property, newValue);
    };

    const clearForm = () => setUpdates({});

    const validateAll = properties => !!properties.map(p => validation.validateProperty(p, current(p.key))).find(v => v);

    return {
        addValue,
        updateValue,
        deleteValue,
        clearForm,

        hasFormUpdates,
        updates,
        valuesWithUpdates,

        validateAll,
        validateProperty: validation.validateProperty,
        allErrors: validation.allErrors,
        isValid: validation.isValid
    };
};

export default useFormData;
