import React from 'react';
import type {MetadataViewFilter} from "./MetadataViewAPI";
import MetadataViewAPI from "./MetadataViewAPI";
import useAsync from "../../common/hooks/UseAsync";
import {isFilesView} from "./metadataViewUtils";
import useStateWithSessionStorage from "../../common/hooks/UseSessionStorage";
import {SESSION_STORAGE_METADATA_FILTERS_KEY} from "../../common/constants";

const MetadataViewContext = React.createContext({});

const LOCATION_FILTER_FIELD = 'location';

export const MetadataViewProvider = ({children, metadataViewApi = MetadataViewAPI}) => {
    const {data = {}, error, loading, refresh} = useAsync(
        () => metadataViewApi.getViews(),
        []
    );

    const [filters: MetadataViewFilter[], setFilters] = useStateWithSessionStorage(
        SESSION_STORAGE_METADATA_FILTERS_KEY, []
    );

    const clearFilter = (facetName: string) => {
        setFilters([...filters.filter(f => f.field !== facetName)]);
    };

    const clearAllFilters = () => {
        setFilters([]);
    };

    const updateFilters = (filterCandidates: MetadataViewFilter[]) => {
        setFilters([...filters.filter(f => !filterCandidates.some(u => u.field === f.field)), ...filterCandidates]);
    };

    const setLocationFilter = (viewName: string, locationContext: string) => {
        if (!isFilesView(viewName) || !locationContext) {
            clearFilter(LOCATION_FILTER_FIELD);
            return;
        }
        const newFilter: MetadataViewFilter = {
            field: LOCATION_FILTER_FIELD,
            values: [locationContext]
        };
        setFilters([...filters.filter(f => ![LOCATION_FILTER_FIELD].includes(f.field)), newFilter]);
    };

    return (
        <MetadataViewContext.Provider
            value={{
                views: data.views,
                facets: data.facets,
                filters,
                setLocationFilter,
                updateFilters,
                clearAllFilters,
                clearFilter,
                error,
                loading,
                refresh
            }}
        >
            {children}
        </MetadataViewContext.Provider>
    );
};

export default MetadataViewContext;
