import {useEffect, useRef} from "react";

const compareObjectsEqual = (o1, o2) => {
    return JSON.stringify(o1) === JSON.stringify(o2);
};

/**
 * Deep-compare two arrays of objects using JSON.stringify key-value pairs comparison (order of pairs matter)
 * @param a1 - first array of objects
 * @param a2 - second array of objects
 * @returns {boolean|*} true if the arrays key-value pairs are equal.
 */
const compareArraysEqual = (a1, a2) => (
    a1.length === a2.length
    && a1.sort().every((value, index) => compareObjectsEqual(value, a2.sort()[index]))
);

const deepCompareEquals = (dependencies, refDependencies) => {
    if (dependencies && refDependencies) {
        return dependencies.every((dep, i) => {
            if (dep instanceof Array) {
                return compareArraysEqual(dep, refDependencies[i]);
            }
            if (dep instanceof Object) {
                return compareObjectsEqual(dep, refDependencies[i]);
            }
            return dep === refDependencies[i];
        });
    }
    return dependencies === refDependencies;
};

const useDeepCompareMemoize = (value) => {
    const ref = useRef();
    if (!deepCompareEquals(value, ref.current)) {
        ref.current = value;
    }
    return ref.current;
};

/**
 * Extension to a React useEffect hook.
 * Uses custom dependencies comparison function, which, as opposed to the standard comparison for non-primitive types,
 * compares objects by comparing key-value pairs, not by references.
 *
 * @param callback
 * @param dependencies
 */
const useDeepCompareEffect = (callback, dependencies) => useEffect(callback, useDeepCompareMemoize(dependencies));

export default useDeepCompareEffect;
