import {useContext, useEffect, useState} from 'react';

import LinkedDataContext from './LinkedDataContext';
import useDeepCompareEffect from "use-deep-compare-effect";

const useLinkedDataSearch = (selectedTypes, query, size, page, availableTypes) => {
    const {shapesLoading, searchLinkedData} = useContext(LinkedDataContext);

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const targetClassesInCatalog = availableTypes.map(typeDefinition => typeDefinition.targetClass).sort();

    useDeepCompareEffect(() => {
        // Only execute search if there are any availableTypes to query on,
        // i.e. when the shapes have been loaded
        if (availableTypes.length === 0 || shapesLoading) {
            return;
        }

        const getTypesToQuery = () => (selectedTypes.length === 0
            ? targetClassesInCatalog
            : selectedTypes.filter(type => targetClassesInCatalog.includes(type)));

        searchLinkedData({
            query: query || '*',
            types: getTypesToQuery(),
            size,
            page
        })
            .then(data => {
                setItems(data.items);
                setTotal(data.total);
                setError(undefined);
            })
            .catch((e) => setError(e || true))
            .finally(() => setLoading(false));
    }, [query, shapesLoading, size, page, targetClassesInCatalog, searchLinkedData, selectedTypes, availableTypes.length]);

    return {
        searchPending: loading,
        searchError: error,
        items,
        total,
        hasHighlights: items && items.some(({highlights}) => highlights.length > 0),
    };
};

export default useLinkedDataSearch;
