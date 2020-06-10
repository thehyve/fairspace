import {isValid} from "date-fns";

//* *********************************
//* ARRAYS
//* *********************************

/**
 * Flattens the given array with a depth of 1
 * @param array
 * @returns {*}
 */
export const flattenShallow = array => [].concat(...array);

/**
 * Joins the given array elements with an optional separator.
 *
 * This method would typically be used to join an array of Jsx components into an array,
 * as the default join method will not work with those
 *
 * @param items
 * @param separator
 * @returns {*[]}
 */
export const joinWithSeparator = (items = [], separator) => items.reduce((prev, curr) => {
    if (!prev || prev.length === 0) return [curr];
    if (separator) return [...prev, separator, curr];
    return [...prev, curr];
}, []);

/**
 * Gets the first element of array if exists.
 * @param array
 * @returns The first element of array or undefined.
 */
export const first = array => ((array && array.length) ? array[0] : undefined);


//* *********************************
//* COMPARISION
//* *********************************

/**
 * Compares given primitives,
 * For strings, cases and accents are ignored, i.e. 'a' !== 'b', 'a' === 'á', 'a' === 'A'
 * @param {*} x
 * @param {*} y
 */
export function comparePrimitives(x, y) {
    if (typeof x === 'string' && typeof y === 'string') {
        return x.localeCompare(y, undefined, {sensitivity: 'base'});
    }

    if (x < y) {
        return -1;
    }
    if (x > y) {
        return 1;
    }
    return 0;
}
export function compareBy(valueExtractor, ascending = true) {
    const transform = (typeof valueExtractor === 'function') ? valueExtractor : x => x[valueExtractor];
    return (x, y) => (ascending ? 1 : -1) * comparePrimitives(transform(x), transform(y));
}

export function comparing(...comparators) {
    return comparators.reduce((c1, c2) => (x, y) => c1(x, y) || c2(x, y));
}

/**
 * Sorting algorithm that will use the original order if
 * the fields are the same, and as such always return a stable order
 * @param array
 * @param cmp
 * @param ascending
 * @returns {*}
 */
export const stableSort = (array, cmp, ascending = true) => array.map((el, index) => [el, index])
    .sort((a, b) => (cmp(a[0], b[0]) || (a[1] - b[1])) * (ascending ? 1 : -1))
    .map(el => el[0]);

/**
 * Returns true if the given value is truthy or zero or false
 * @param value
 */
export const isNonEmptyValue = (value) => Boolean(value) || value === 0 || value === false;

//* *********************************
//* DATE - TIME (PS: We should utilize the already used date-fns library for a more reliable code)
//* *********************************

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric'
});

/**
 * Returns a user friendly date/date-time format, it will return the time if the date is today
 *
 * @param {string | number | Date} value - the date to be formatted
 * @return {string} the formatted date
 */
export const formatDateTime = (value) => {
    const date = new Date(value);
    if (!value || !isValid(date)) {
        return value;
    }

    const today = new Date();
    const isToday = (today.toDateString() === date.toDateString());
    return isToday ? timeFormatter.format(date) : dateFormatter.format(date);
};
