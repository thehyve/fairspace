import {useState} from "react";
import {MetadataViewAPI} from "../views/MetadataViewAPI";
import type {ExternalMetadataSource} from "./externalMetadataSourceUtils";

/**
 * This hook contains logic about files for a certain external storage.
 */
export const useExternalMetadataSourceViewFacets = (source: ExternalMetadataSource, metadataViewApi = new MetadataViewAPI(source.path)) => {
    const [data, setData] = useState({});
    const [facetsLoading, setFacetsLoading] = useState(true);
    const [facetsError, setFacetsError] = useState();
    const [requested, setRequested] = useState(false);

    const initialLoad = () => {
        if (!requested) {
            setRequested(true);
            metadataViewApi.getFacets()
                .then(d => {
                    setData(d);
                    setFacetsError(undefined);
                })
                .catch((e) => {
                    setFacetsError(e || true);
                    console.error(e || new Error('Unknown error while fetching facets.'));
                })
                .finally(() => setFacetsLoading(false));
        }
    };

    return {
        facets: data && data.facets,
        facetsError,
        facetsLoading,
        initialLoad
    };
};
