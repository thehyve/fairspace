import queryString from 'query-string';
import React from 'react';
import {handleAuthError} from "../common/utils/httpUtils";
import Iri from '../common/components/Iri';

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
export const getSearchContextFromString = (searchString) => queryString.parse(searchString).context || '';

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

/**
 * Renders the value of a property for an item from search results,
 * using the version with highlighted search text as received from
 * the search result, if available.
 * @param item the item in the search result list
 * @param property the property name
 * @returns {JSX.Element|*}
 */
export const renderSearchResultProperty = (item, property) => {
    // eslint-disable-next-line no-unused-vars
    const highlights = item.highlights && item.highlights.find(([key, value]) => key === property);
    if (!highlights) {
        const value = item[property] && item[property][0];
        if (property === 'label') {
            return value || <Iri iri={item.id} />;
        }
        return value;
    }
    // eslint-disable-next-line no-unused-vars
    const [key, value] = highlights;
    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{__html: value}} />;
};
