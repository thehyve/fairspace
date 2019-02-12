import queryString from 'query-string';

export const buildSearchUrl = (type, query) => `/search?${queryString.stringify({type, q: query})}`;

export const getSearchTypeFromString = (searchString) => queryString.parse(searchString).type || 'collections';

export const getSearchQueryFromString = (searchString) => queryString.parse(searchString).q || '';
