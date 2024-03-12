import {useEffect, useState} from "react";

/**
 * Custom state hook to use either the initial value from the session storage or a default value.
 * Data in sessionStorage is cleared when the page session ends.
 *
 * @param sessionStorageKey     Key to store and retrieve the data
 * @param defaultValue          Default value, if session storage for this key is empty
 *
 * @returns A stateful value, and a function to update it.
 */
const useStateWithSessionStorage = (sessionStorageKey, defaultValue) => {
    const [value, setValue] = useState(
        JSON.parse(sessionStorage.getItem(sessionStorageKey)) || defaultValue
    );

    useEffect(() => {
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return [value, setValue];
};

export default useStateWithSessionStorage;
