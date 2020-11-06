import axios from "axios";
import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {applyViewIcons} from "./metadataViewUtils";

const metadataViewUrl = "/api/v1/views/";

export type ValueType = 'id' | 'text' | 'number' | 'date';

export type MetadataViewFilter = {
    field: string;
    values: any[];
    rangeStart: any;
    rangeEnd: any;
}

export type MetadataViewFacet = {
    name: string;
    title: string;
    query: string;
    type: ValueType;
    values: string[]; // TODO - other types
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
    columns: MetadataViewColumn[]
};

export type MetadataViewData = {
    page: number;
    rows: Map<string, any>[]
};


class MetadataViewAPI {
    getViews(): Promise<MetadataViewOptions[]> {
        return axios.get(metadataViewUrl, {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .then(applyViewIcons)
            .catch(handleHttpError("Failure when retrieving metadata views configuration."));
    }

    getFacets(): Promise<MetadataViewFacet[]> {
        return axios.get(`${metadataViewUrl}/facets`, {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .catch(handleHttpError("Failure when retrieving facets."));
    }

    getViewData(view, page, size, filters: MetadataViewFilter[] = []): Promise<MetadataViewData> {
        const viewRequest = {
            view,
            filters,
            page,
            size
        };
        return axios.post(metadataViewUrl, viewRequest,
            {headers: {Accept: 'application/json'}})
            .then(extractJsonData)
            .catch(handleHttpError("Error while fetching view data."));
    }
}

export default new MetadataViewAPI();
