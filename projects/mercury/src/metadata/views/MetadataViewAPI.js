/* eslint-disable no-unused-vars */
import axios from "axios";
import {extractJsonData, handleHttpError} from "../../common/utils/httpUtils";
import {mapMetadataViews} from "./metadataViewUtils";

const metadataViewUrl = "/api/v1/views/";

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

type MetadataViewDataRequest = {
    view: string;
    filters: MetadataViewFilter[];
    page: number;
    size: number;
};

class MetadataViewAPI {
    getViews(): Promise<MetadataViews> {
        return axios.get(metadataViewUrl, {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .then(mapMetadataViews)
            .catch(handleHttpError("Failure when retrieving metadata views configuration."));
    }

    getViewData(viewName: string, page, size, filters: MetadataViewFilter[] = []): Promise<MetadataViewData> {
        const viewRequest: MetadataViewDataRequest = {
            view: viewName,
            filters,
            page,
            size: size + 1
        };
        return axios.post(metadataViewUrl, viewRequest,
            {headers: {Accept: 'application/json'}})
            .then(extractJsonData)
            .catch(handleHttpError("Error while fetching view data."));
    }
}

export default new MetadataViewAPI();
