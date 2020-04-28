import {useCallback, useEffect, useState} from "react";

/**
 * Custom hook to perform an async call and keeps track of the result.
 *
 * This hook will execute the callback function once, and keep track of the loading or error
 * state.
 *
 * @param callback that will return a promise
 * @returns {any[]}
 */
const useAsync = (callback) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const refresh = useCallback(() => callback()
        .then(d => {
            setData(d);
            setError(undefined);
        })
        .catch((e) => setError(e || true))
        .finally(() => setLoading(false)), [callback]);

    useEffect(() => {refresh();}, []);

    return {
        data,
        loading,
        error,
        refresh
    };
};

export default useAsync;
