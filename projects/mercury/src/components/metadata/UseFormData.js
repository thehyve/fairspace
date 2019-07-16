import {useState} from "react";

/**
 * This hook is concerned about storing form state for linked data
 * @param values
 * @returns {{valuesWithUpdates: any, updateValue: updateValue, hasFormUpdates: any, deleteValue: deleteValue, updates: any, addValue: addValue}}
 */
const useFormData = (values) => {
    const [updates, setUpdates] = useState({});

    const hasFormUpdates = Object.keys(updates).length > 0;
    const valuesWithUpdates = {...values, ...updates};

    const addValue = (property, value) => {
        setUpdates({
            ...updates,
            [property.key]: [...valuesWithUpdates[property.key], value]
        });
    };

    const updateValue = (property, value, index) => {
        setUpdates({
            ...updates,
            [property.key]: valuesWithUpdates[property.key].map((el, idx) => ((idx === index) ? value : el))
        });
    };

    const deleteValue = (property, index) => {
        setUpdates({
            ...updates,
            [property.key]: valuesWithUpdates[property.key].filter((el, idx) => idx !== index)
        });
    };

    const clearForm = () => setUpdates({});

    return {
        addValue,
        updateValue,
        deleteValue,

        hasFormUpdates,
        updates,
        valuesWithUpdates,
        clearForm
    };
};

export default useFormData;
