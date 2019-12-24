import queryString from 'query-string';

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
