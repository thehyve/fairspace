import queryString from 'query-string';
import React from 'react';
import { handleAuthError } from '../common/utils/httpUtils';
import Iri from '../common/components/Iri';
import { getPathFromIri } from '../file/fileUtils';
import type { ExternalStorage } from '../external-storage/externalStorageUtils';
import { getExternalStoragePathPrefix } from '../external-storage/externalStorageUtils';
import { isEmptyObject } from '../common/utils/genericUtils';

export const handleTextSearchRedirect = (history: History, value: string, context: string = '', storage: ExternalStorage = {}) => {
    if (value) {
        const queryParams = { q: value, context };
        if (!isEmptyObject(storage)) {
            queryParams.storage = storage.name;
        }
        history.push('/text-search/?' + queryString.stringify(queryParams));
    } else if (!isEmptyObject(storage)) {
        history.push(`/external-storages/${storage.name}/${context ? getPathFromIri(context, storage.rootDirectoryIri) : ''}`);
    } else {
        history.push(`/collections/${context ? getPathFromIri(context) : ''}`);
    }
};

export const getSearchPathSegments = (context, storageName = '') => {
    const segments = ((context && getPathFromIri(context)) || '').split('/');
    const result = [];
    if (segments[0] === '') {
        result.push({ label: 'Search results', href: '' });
        return result;
    }
    let href = storageName ? getExternalStoragePathPrefix(storageName) : '/collections';
    segments.forEach(segment => {
        href += '/' + segment;
        result.push({ label: segment, href });
    });
    result.push({ label: 'Search results', href: '' });
    return result;
};

export const getSearchQueryFromString = (searchString) => queryString.parse(searchString).q || '';
export const getLocationContextFromString = (searchString) => queryString.parse(searchString).context || '';
export const getStorageFromString = (searchString) => queryString.parse(searchString).storage || '';
export const getMetadataViewNameFromString = (searchString) => queryString.parse(searchString).view || '';

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
        default: throw new Error('Error retrieving search results');
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
    return <span dangerouslySetInnerHTML={{ __html: value }} />;
};
