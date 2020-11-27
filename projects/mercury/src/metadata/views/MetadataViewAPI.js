/* eslint-disable no-unused-vars */
import axios, {CancelToken, CancelTokenSource} from "axios";
import {extractJsonData, handleHttpError} from "../../common/utils/httpUtils";
import {mapMetadataViews} from "./metadataViewUtils";

export type ValueType = 'id' | 'text' | 'number' | 'date' | 'dataLink';

export type MetadataViewFilter = {
    field: string;
    values: any[];
    min: any;
    max: any;
}

export type MetadataViewFacetValue = {
    label: string;
    value: string; // iri
};

export type MetadataViewFacet = {
    name: string;
    title: string;
    type: ValueType;
    values: MetadataViewFacetValue[];
    min: any;
    max: any;
};

export type MetadataViewColumn = {
    name: string;
    title: string;
    type: ValueType;
};

export type MetadataViewOptions = {
    name: string;
    title: string;
    icon: Object;
    columns: MetadataViewColumn[];
};

export type MetadataViews = {
    facets: MetadataViewFacet[];
    views: MetadataViewOptions[]
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
|};

const metadataViewUrl = "/api/v1/views/";

const defaultRequestOptions = {
    headers: {Accept: 'application/json'}
};

class MetadataViewAPI {
    getViews(): Promise<MetadataViews> {
        return axios.get(metadataViewUrl, defaultRequestOptions)
            .then(extractJsonData)
            .then(mapMetadataViews)
            .catch(handleHttpError("Failure when retrieving metadata views configuration."));
    }

    getViewData(cancelToken: CancelTokenSource, viewName: string, page, size, filters: MetadataViewFilter[] = []): Promise<MetadataViewData> {
        const viewRequest: MetadataViewDataRequest = {
            view: viewName,
            filters,
            page,
            size
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
