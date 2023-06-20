/* eslint-disable no-unused-vars */
import axios, {CancelTokenSource} from "axios";
import {extractJsonData, handleHttpError} from "../../common/utils/httpUtils";
import type {AccessLevel} from "../../collections/CollectionAPI";

export type ValueType = 'Identifier' | 'Text' | 'Number' | 'Date' | 'Term' | 'Set' | 'TermSet' | 'Boolean';
export const TextualValueTypes: ValueType[] = ['Identifier', 'Text', 'Set'];

export type MetadataViewFilter = {
    field: string;
    values: any[];
    min: any;
    max: any;
    prefix: string;
    booleanValue?: boolean;
}

export type MetadataViewFacetValue = {
    label: string;
    value: string; // iri
    access?: AccessLevel;
};

export type MetadataViewFacet = {
    name: string;
    title: string;
    type: ValueType;
    values: MetadataViewFacetValue[];
    min: any;
    max: any;
    booleanValue?: boolean;
};

export type MetadataViewColumn = {
    name: string;
    title: string;
    type: ValueType;
};

export type MetadataViewOptions = {
    name: string;
    title: string;
    columns: MetadataViewColumn[];
};

export type MetadataViews = {
    views: MetadataViewOptions[];
};

export type MetadataFacets = {
    facets: MetadataViewFacet[];
};

export type MetadataViewData = {
    page: number;
    rows: Map<string, any>[];
    hasNext: boolean;
    timeout: boolean;
};

export type MetadataViewDataCount = {
    count: number;
    timeout: boolean;
};

type MetadataViewCountRequest = {
    view: string;
    filters: MetadataViewFilter[];
};

type MetadataViewDataRequest = MetadataViewCountRequest & {|
    page: number;
    size: number;
    includeJoinedViews: boolean;
|};

const metadataViewUrl = "/api/views/";

const defaultRequestOptions = {
    headers: {Accept: 'application/json'}
};

class MetadataViewAPI {
    getViews(): Promise<MetadataViews> {
        return axios.get(metadataViewUrl, defaultRequestOptions)
            .then(extractJsonData)
            .catch(handleHttpError("Failure when retrieving metadata views."));
    }

    getFacets(): Promise<MetadataFacets> {
        return axios.get(`${metadataViewUrl}facets`, defaultRequestOptions)
            .then(extractJsonData)
            .catch(handleHttpError("Failure when retrieving metadata facets."));
    }

    getViewData(cancelToken: CancelTokenSource, viewName: string, page, size, filters: MetadataViewFilter[] = []): Promise<MetadataViewData> {
        const viewRequest: MetadataViewDataRequest = {
            view: viewName,
            filters,
            page: page + 1, // API endpoint expects 1-base page number
            size,
            includeJoinedViews: true
        };
        const requestOptions = cancelToken ? {...defaultRequestOptions, cancelToken: cancelToken.token} : defaultRequestOptions;

        return axios.post(metadataViewUrl, viewRequest, requestOptions)
            .then(extractJsonData)
            .catch(handleHttpError("Error while fetching view data."));
    }

    getCount(cancelToken: CancelTokenSource, viewName: string, filters: MetadataViewFilter[] = []): Promise<MetadataViewDataCount> {
        const viewRequest: MetadataViewCountRequest = {
            view: viewName,
            filters
        };
        const requestOptions = cancelToken ? {...defaultRequestOptions, cancelToken: cancelToken.token} : defaultRequestOptions;

        return axios.post(`${metadataViewUrl}count`, viewRequest, requestOptions)
            .then(extractJsonData)
            .catch(handleHttpError("Error while fetching view count."));
    }
}

export default new MetadataViewAPI();
