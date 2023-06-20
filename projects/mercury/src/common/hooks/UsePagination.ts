// @ts-nocheck
import {useEffect, useState} from "react";

/**
 * Custom hook to perform pagination
 * @param items     Sorted items
 * @param initialRowsPerPage
 * @returns {{pagedItems: *, page: number, setRowsPerPage: function, rowsPerPage: number, setPage: function<Number>>}}
 */
const usePagination = (items, initialRowsPerPage = 10) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
    // Reset the page when the number of items per page changes
    useEffect(() => setPage(0), [rowsPerPage]);
    const pagedItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return {
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        pagedItems
    };
};

export default usePagination;