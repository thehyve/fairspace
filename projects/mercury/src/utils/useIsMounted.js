import {useRef, useEffect} from 'react';

/**
 * This custom hook keeps track of the mounted state of a component or hook.
 *
 * It can be used to safeguard promise callbacks from updating the state on a component
 * that has been unmounted already.
 *
 * @returns {function(): boolean}
 */
const useIsMounted = () => {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    return () => isMounted.current;
};

export default useIsMounted;
