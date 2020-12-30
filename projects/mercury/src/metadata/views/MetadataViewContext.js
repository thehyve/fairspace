import React from 'react';
import type {MetadataViewFilter} from "./MetadataViewAPI";
import MetadataViewAPI from "./MetadataViewAPI";
import useAsync from "../../common/hooks/UseAsync";
import useStateWithSessionStorage from "../../common/hooks/UseSessionStorage";
import {isNonEmptyValue} from "../../common/utils/genericUtils";

const MetadataViewContext = React.createContext({});

const LOCATION_FILTER_FIELD = 'location';
const SESSION_STORAGE_METADATA_FILTERS_KEY = 'FAIRSPACE_METADATA_FILTERS';
const SESSION_STORAGE_USE_LOCATION_CONTEXT_KEY = 'FAIRSPACE_USE_LOCATION_CONTEXT';

export const MetadataViewProvider = ({children, metadataViewApi = MetadataViewAPI}) => {
    const {data = {}, error, loading, refresh} = useAsync(
        () => metadataViewApi.getViews(),
        []
    );

    const [useLocationContext, setUseLocationContext] = useStateWithSessionStorage(
        SESSION_STORAGE_USE_LOCATION_CONTEXT_KEY, false
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

    const setLocationFilter = (locationContext: string) => {
        if (!locationContext) {
            if (useLocationContext) {
                clearFilter(LOCATION_FILTER_FIELD);
            }
            setUseLocationContext(false);
        } else {
            const newFilter: MetadataViewFilter = {
                field: LOCATION_FILTER_FIELD,
                values: [locationContext]
            };
            setFilters([...filters.filter(f => ![LOCATION_FILTER_FIELD].includes(f.field)), newFilter]);
            setUseLocationContext(true);
        }
    };

    return (
        <MetadataViewContext.Provider
            value={{
                views: data.views,
                facets: data.facets,
                resourcesView: data.resourcesView,
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
