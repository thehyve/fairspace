import {useEffect, useState} from 'react';

/**
 * Custom state hook to use either the initial value from the local storage or a default value.
 * Data in localStorage persists until explicitly deleted.
 *
 * @param localStorageKey     Key to store and retrieve the data
 * @param defaultValue        Default value, if local storage for this key is empty
 *
 * @returns A stateful value, and a function to update it.
 */
const useStateWithLocalStorage = (localStorageKey, defaultValue) => {
    const [value, setValue] = useState(
        JSON.parse(localStorage.getItem(localStorageKey)) || defaultValue
    );

    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return [value, setValue];
};

export default useStateWithLocalStorage;
