import {useEffect, useState} from 'react';
import {SEARCH_DEFAULT_SIZE} from "../constants";

/**
 * This hook keeps track of the search parameters as provided on
 * a linked data search page
 * @returns {{setSelectedTypes: React.Dispatch<React.SetStateAction<Array>>, setSize: React.Dispatch<React.SetStateAction<number>>, size: number, selectedTypes: Array, query: any, page: number, availableTypes: *, setQuery: React.Dispatch<React.SetStateAction<any>>, setPage: React.Dispatch<React.SetStateAction<number>>}}
 */
const useLinkedDataSearchParams = () => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [query, setQuery] = useState(null);
    const [size, setSize] = useState(SEARCH_DEFAULT_SIZE);
    const [page, setPage] = useState(0);

    // reset page to start from first page when query or size changes
    useEffect(() => {
        setPage(0);
    }, [query, size]);

    return {
        query,
        selectedTypes,
        size,
        page,
        setQuery,
        setSelectedTypes,
        setPage,
        setSize
    };
};

export default useLinkedDataSearchParams;
