import type {MetadataViewFilter} from "../views/MetadataViewAPI";
import {MetadataViewAPI} from "../views/MetadataViewAPI";
import useStateWithSessionStorage from "../../common/hooks/UseSessionStorage";
import {isNonEmptyValue} from "../../common/utils/genericUtils";
import useAsync from "../../common/hooks/UseAsync";
import type {ExternalMetadataSource} from "./externalMetadataSourceUtils";

const SESSION_STORAGE_EXTERNAL_METADATA_FILTERS_KEY = 'FAIRSPACE_EXTERNAL_METADATA_FILTERS';

/**
 * This hook contains logic about files for a certain external storage.
 */
export const useExternalMetadataSource = (source: ExternalMetadataSource, metadataViewAPI = new MetadataViewAPI(source.path)) => {
    const {data = {}, error, loading, refresh} = useAsync(
        () => metadataViewAPI.getViews(),
        []
    );

    const [filters: MetadataViewFilter[], setFilters] = useStateWithSessionStorage(
        `${SESSION_STORAGE_EXTERNAL_METADATA_FILTERS_KEY}_${source.name}`, []
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
            ...filterCandidates.filter(f => (
                (f.values && f.values.length > 0) || isNonEmptyValue(f.min) || isNonEmptyValue(f.max) || f.prefix != null || f.booleanValue != null
            ))
        ]);
    };

    return {
        views: data.views,
        filters,
        updateFilters,
        clearAllFilters,
        clearFilter,
        error,
        loading,
        refresh,
        metadataViewAPI
    };
};
