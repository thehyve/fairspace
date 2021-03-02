import queryString from 'query-string';
import React from 'react';
import {handleAuthError} from "../common/utils/httpUtils";
import Iri from '../common/components/Iri';
import {pathForIri} from "../collections/collectionUtils";

export const handleTextSearchRedirect = (history, value, context = '', storageName = null) => {
    if (value) {
        const queryParams = {q: value, context};
        if (storageName) {
            queryParams.storage = storageName;
        }
        history.push('/text-search/?' + queryString.stringify(queryParams));
    } else if (storageName) {
        history.push(`/external-storages/${storageName}/${context ? pathForIri(context) : ''}`);
    } else {
        history.push(`/collections/${context ? pathForIri(context) : ''}`);
    }
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
