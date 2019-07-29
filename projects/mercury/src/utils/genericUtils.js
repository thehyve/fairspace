import {isValid} from "date-fns";

//* *********************************
//* ARRAYS
//* *********************************

/**
 * Get the first item that has an id that matches the given {itemId}
 * @param itemList
 * @param itemId
 */
export function findById(itemList, itemId) {
    return Array.isArray(itemList)
        ? itemList.find(item => item.id === itemId) : undefined;
}

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
export const joinWithSeparator = (items = [], separator) => {
    return items.reduce((prev, curr) => {
        if (!prev || prev.length === 0) return [curr];
        if (separator) return [...prev, separator, curr];
        return [...prev, curr];
    }, []);
};

//* *********************************
//* COMPARISION
//* *********************************

export function comparePrimitives(x, y) {
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
