import queryString from 'query-string';

import {COLLECTION_SEARCH_TYPE} from '../constants';

/**
 * Builds a search URL with the given query and type
 * @param query
 * @param type  Type to search for. Can be left blank
 * @returns {string}
 */
export const buildSearchUrl = (query, type) => {
    if (!type && !query) {
        return '/search';
    }

    const searchString = queryString.stringify({type, q: query});
    return `/search?${searchString}`;
};

export const getSearchTypeFromString = (searchString) => queryString.parse(searchString).type || COLLECTION_SEARCH_TYPE;

export const getSearchQueryFromString = (searchString) => queryString.parse(searchString).q || '';
