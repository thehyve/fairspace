import queryString from 'query-string';
import {handleAuthError} from "../common/utils/httpUtils";

/**
 * Builds a search URL with the given query
 * @param query
 * @returns {string}
 */
export const buildSearchUrl = (query) => {
    if (!query) {
        return '/search';
    }

    const searchString = queryString.stringify({q: query});
    return `/search?${searchString}`;
};

export const getSearchQueryFromString = (searchString) => queryString.parse(searchString).q || '';

/**
 * Error handler for search queries. Handles HTTP statuses 400 and 401 separately
 * @param e
 */
export const handleSearchError = (e) => {
    switch (e.status) {
        case 400: throw new Error("Oops, we're unable to parse this query. Please only use alphanumeric characters.");
        case 401:
        case 403:
            handleAuthError(e.status);
            break;
        default: throw new Error("Error retrieving search results");
    }
};
