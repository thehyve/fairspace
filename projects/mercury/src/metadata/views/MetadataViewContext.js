import React from 'react';
import type {MetadataViewFacet, MetadataViewFilter, ValueType} from "./MetadataViewAPI";
import MetadataViewAPI from "./MetadataViewAPI";
import useAsync from "../../common/hooks/UseAsync";
import {isFilesView, LOCATION_FILTER_FIELD, LOCATION_RELATED_FACETS, ofRangeValueType} from "./metadataViewUtils";
import {isNonEmptyValue} from "../../common/utils/genericUtils";
import useStateWithSessionStorage from "../../common/hooks/UseSessionStorage";
import {SESSION_STORAGE_METADATA_FILTERS_KEY} from "../../common/constants";

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

    const setFilterValues = (type: ValueType, filter: MetadataViewFilter, values: any[]) => {
        if (ofRangeValueType(type)) {
            [filter.min, filter.max] = values;
        } else {
            filter.values = values;
        }
    };

    const updateFilters = (facet: MetadataViewFacet, values: any[]) => {
        if (filters.find(f => f.field === facet.name)) {
            let updatedFilters;
            if (values && values.length > 0 && values.some(isNonEmptyValue)) {
                updatedFilters = [...filters];
                const filter = updatedFilters.find(f => (f.field === facet.name));
                setFilterValues(facet.type, filter, values);
            } else {
                updatedFilters = [...filters.filter(f => f.field !== facet.name)];
            }
            setFilters(updatedFilters);
        } else {
            const newFilter: MetadataViewFilter = {
                field: facet.name
            };
            setFilterValues(facet.type, newFilter, values);
            setFilters([...filters, newFilter]);
        }
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
