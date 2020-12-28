import React from 'react';
import type {MetadataViewFilter} from "./MetadataViewAPI";
import MetadataViewAPI from "./MetadataViewAPI";
import useAsync from "../../common/hooks/UseAsync";
import {isFilesView, LOCATION_FILTER_FIELD, LOCATION_RELATED_FACETS} from "./metadataViewUtils";
import useStateWithSessionStorage from "../../common/hooks/UseSessionStorage";
import {SESSION_STORAGE_METADATA_FILTERS_KEY} from "../../common/constants";
import {isNonEmptyValue} from "../../common/utils/genericUtils";

const MetadataViewContext = React.createContext({});

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
        setFilters([
            ...filters.filter(f => !filterCandidates.some(u => u.field === f.field)),
            ...filterCandidates.filter(f => (f.values && f.values.length > 0) || isNonEmptyValue(f.min) || isNonEmptyValue(f.max))
        ]);
    };

    const setLocationFilter = (viewName: string, locationContext: string) => {
        if (!isFilesView(viewName) || !locationContext) {
            clearFilter(LOCATION_FILTER_FIELD);
            return;
        }
        const newFilter: MetadataViewFilter = {
            field: LOCATION_FILTER_FIELD,
            prefix: locationContext
        };
        setFilters([...filters.filter(f => ![LOCATION_FILTER_FIELD, ...LOCATION_RELATED_FACETS].includes(f.field)), newFilter]);
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
