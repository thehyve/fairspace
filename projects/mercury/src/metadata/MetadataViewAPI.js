import axios from "axios";
import {extractJsonData, handleHttpError} from "../../common/utils/httpUtils";
import {applyViewIcons} from "./metadataViewUtils";
import {mockGetFacets, mockGetViewData, mockGetViews} from "../__mocks__/MetadataViewAPI";

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
    values: string[];
    rangeStart: any;
    rangeEnd: any;
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
        // return axios.get(metadataViewUrl, {
        //     headers: {Accept: 'application/json'},
        // })
        //     .then(extractJsonData)
        return mockGetViews()
            .then(applyViewIcons)
            .catch(handleHttpError("Failure when retrieving metadata views configuration."));
    }

    getFacets(viewName: string): Promise<MetadataViewFacet[]> {
        // return axios.get(`${metadataViewUrl}/facets`, {
        //     headers: {Accept: 'application/json'},
        // })
        //     .then(extractJsonData)
        return mockGetFacets(viewName)
            .catch(handleHttpError("Failure when retrieving facets."));
    }

    getViewData(viewName: string, page, size, filters: MetadataViewFilter[] = []): Promise<MetadataViewData> {
        // const viewRequest = {
        //     view: viewName,
        //     filters,
        //     page,
        //     size
        // };
        // return axios.post(metadataViewUrl, viewRequest,
        //     {headers: {Accept: 'application/json'}})
        //     .then(extractJsonData)
        return mockGetViewData(viewName)
            .catch(handleHttpError("Error while fetching view data."));
    }
}

export default new MetadataViewAPI();
