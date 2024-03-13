import React, {useContext, useState} from 'react';
import {MetadataViewAPI} from './MetadataViewAPI';
import MetadataAPIPathContext from '../common/MetadataAPIPathContext';

/**
 * This context provides a lazy-loaded data to the child objects.
 * The data is fetched only once by a component that first triggers the initial load in a tree of React components.
 */
const MetadataViewFacetsContext = React.createContext({});

export const MetadataViewFacetsProvider = ({children}) => {
    const {path: metadataAPIPath} = useContext(MetadataAPIPathContext);
    const [data, setData] = useState({});
    const [facetsLoading, setFacetsLoading] = useState(true);
    const [facetsError, setFacetsError] = useState();
    const [requested, setRequested] = useState(false);

    const initialLoad = () => {
        if (!requested) {
            setRequested(true);
            new MetadataViewAPI(metadataAPIPath)
                .getFacets()
                .then(d => {
                    setData(d);
                    setFacetsError(undefined);
                })
                .catch(e => {
                    setFacetsError(e || true);
                    console.error(e || new Error('Unknown error while fetching facets.'));
                })
                .finally(() => setFacetsLoading(false));
        }
    };

    return (
        <MetadataViewFacetsContext.Provider
            value={{
                facets: data && data.facets,
                facetsError,
                facetsLoading,
                initialLoad
            }}
        >
            {children}
        </MetadataViewFacetsContext.Provider>
    );
};

export default MetadataViewFacetsContext;
