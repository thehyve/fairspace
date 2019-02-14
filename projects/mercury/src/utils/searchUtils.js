import queryString from 'query-string';

import {COLLECTION_SEARCH_TYPE} from '../constants';

export const buildSearchUrl = (type, query) => `/search?${queryString.stringify({type, q: query})}`;

export const getSearchTypeFromString = (searchString) => queryString.parse(searchString).type || COLLECTION_SEARCH_TYPE;

export const getSearchQueryFromString = (searchString) => queryString.parse(searchString).q || '';
