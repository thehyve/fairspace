/* eslint-disable no-unused-vars */
import axios, {CancelTokenSource} from "axios";
import {extractJsonData, handleHttpError, handleRemoteSourceHttpError} from "../../common/utils/httpUtils";
import type {AccessLevel} from "../../collections/CollectionAPI";
import FileAPI from "../../file/FileAPI";

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
    displayIndex: number;
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

const defaultRequestOptions = {
    headers: {Accept: 'application/json'}
};

export class MetadataViewAPI {
    constructor(remoteURLPrefix = "/api") {
        this.remoteURL = remoteURLPrefix + "/views";
        this.isExternalSource = (remoteURLPrefix !== "/api");
    }

    handleMetadataViewHttpError(message: string) {
        if (this.isExternalSource) {
            return handleRemoteSourceHttpError(message);
        }
        return handleHttpError("Failure when retrieving metadata views.");
    }

    getViews(): Promise<MetadataViews> {
        return axios.get(`${this.remoteURL}/`, defaultRequestOptions)
            .then(extractJsonData)
            .catch(this.handleMetadataViewHttpError("Failure when retrieving metadata views."));
    }

    getFacets(): Promise<MetadataFacets> {
        return axios.get(`${this.remoteURL}/facets`, defaultRequestOptions)
            .then(extractJsonData)
            .catch(this.handleMetadataViewHttpError("Failure when retrieving metadata facets."));
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

        return axios.post(`${this.remoteURL}/`, viewRequest, requestOptions)
            .then(extractJsonData)
            .catch(this.handleMetadataViewHttpError("Error while fetching view data."));
    }

    getCount(cancelToken: CancelTokenSource, viewName: string, filters: MetadataViewFilter[] = []): Promise<MetadataViewDataCount> {
        const viewRequest: MetadataViewCountRequest = {
            view: viewName,
            filters
        };
        const requestOptions = cancelToken ? {...defaultRequestOptions, cancelToken: cancelToken.token} : defaultRequestOptions;

        return axios.post(`${this.remoteURL}/count`, viewRequest, requestOptions)
            .then(extractJsonData)
            .catch(handleHttpError("Error while fetching view count."));
    }
}

const LocalMetadataViewAPI = new MetadataViewAPI();

export default LocalMetadataViewAPI;
