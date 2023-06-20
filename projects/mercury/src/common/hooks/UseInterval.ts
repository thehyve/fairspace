// @ts-nocheck
import {useEffect, useRef} from "react";

/**
 * A hook to set up an interval and clear it after the component unmounts
 * @param callback   function to be called in intervals
 * @param delay      delay between callbacks
 */
const useInterval = (callback, delay) => {
    const callbackRef = useRef();
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);
    useEffect(() => {
        const doCallback = () => {
            callbackRef.current();
        };

        if (delay !== null) {
            const id = setInterval(doCallback, delay);
            return () => clearInterval(id);
        }

        return () => {};
    }, [delay]);
};

export default useInterval;