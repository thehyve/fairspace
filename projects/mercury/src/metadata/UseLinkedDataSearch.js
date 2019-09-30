import {useContext, useEffect} from 'react';

import LinkedDataContext from './LinkedDataContext';

const useLinkedDataSearch = (selectedTypes, query, size, page, availableTypes) => {
    const {
        shapesLoading, searchLinkedData, getSearchResults
    } = useContext(LinkedDataContext);

    const {pending, error, items, total} = getSearchResults();

    // Execute query when any of the parameters changes
    useEffect(() => {
        // Only execute search if there are any availableTypes to query on,
        // i.e. when the shapes have been loaded
        if (availableTypes.length === 0 || shapesLoading) {
            return;
        }

        const getTypesToQuery = () => {
            const targetClassesInCatalog = availableTypes.map(typeDefinition => typeDefinition.targetClass);

            return selectedTypes.length === 0
                ? targetClassesInCatalog
                : selectedTypes.filter(type => targetClassesInCatalog.includes(type));
        };

        searchLinkedData({
            query: query || '*',
            types: getTypesToQuery(),
            size,
            page
        });

        // Due to current setup of how vocabulary/meta-vocab is being store, getClassesInCatalog can't be added as dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, shapesLoading, selectedTypes, size, page]);

    return {
        searchPending: pending,
        searchError: error,
        items,
        total,
        hasHighlights: items.some(({highlights}) => highlights.length > 0),
    };
};

export default useLinkedDataSearch;
