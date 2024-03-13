import {useState} from 'react';

import {compareBy, stableSort} from '../utils/genericUtils';

/**
 * Custom hook to perform sorting
 * @param items     List of items to be sorted
 * @param columns   Key-value pairs defining the columns. The key is an identifier, the value is
 *                  an object containing the following keys:
 *                      valueExtractor: either a function for extracting the value to sort on from an item,
 *                                      or a property name for extracting the value from the item.
 *                                      It is passed to the {compareBy} function
 * @param initialOrderBy    Initial column to order on
 * @returns {{toggleSort: toggleSort, orderAscending: boolean, orderBy: any, orderedItems: *}}
 * @see {compareBy}
 */
const useSorting = (items, columns, initialOrderBy) => {
    const [orderAscending, setOrderAscending] = useState(true);
    const [orderBy, setOrderBy] = useState(initialOrderBy);

    const orderedItems = stableSort(
        items,
        compareBy(columns[orderBy].valueExtractor),
        orderAscending
    );
    const toggleSort = column => {
        if (orderBy === column) {
            setOrderAscending(!orderAscending);
        } else {
            setOrderAscending(true);
            setOrderBy(column);
        }
    };

    return {
        orderAscending,
        orderBy,
        toggleSort,

        orderedItems
    };
};

export default useSorting;
