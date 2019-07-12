import {useState, useContext, useEffect} from 'react';

import LinkedDataContext from './LinkedDataContext';
import {getFirstPredicateId} from "../../utils/linkeddata/jsonLdUtils";
import {SEARCH_DEFAULT_SIZE, SHACL_TARGET_CLASS} from "../../constants";
import {getLabel} from "../../utils/linkeddata/metadataUtils";

const useLinkedDataSearch = (doInitialFetch = false) => {
    const {
        getClassesInCatalog, searchLinkedData, shapesLoading,
        shapesError, getSearchEntities
    } = useContext(LinkedDataContext);

    const [selectedTypes, setSelectedTypes] = useState([]);
    const [query, setQuery] = useState(null);
    const [size, setSize] = useState(SEARCH_DEFAULT_SIZE);
    const [page, setPage] = useState(0);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const {searchPending, searchError, entities, total, hasHighlights} = getSearchEntities();

    // reset page to start from first page when query or size changes
    useEffect(() => {
        setPage(0);
    }, [query, size]);

    useEffect(() => {
        if (query === null) {
            return;
        }

        const getTypes = () => {
            const classesInCatalog = getClassesInCatalog();

            const shapes = selectedTypes.length === 0 ? classesInCatalog : classesInCatalog.filter(c => {
                const targetClass = getFirstPredicateId(c, SHACL_TARGET_CLASS);
                return selectedTypes.includes(targetClass);
            });

            return shapes.map(c => getFirstPredicateId(c, SHACL_TARGET_CLASS));
        };

        searchLinkedData({query, types: getTypes(), size, page});

        // Due to current setup of how vocabulary/meta-vocab is being store, getClassesInCatalog can't be added as dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, selectedTypes, size, page, searchLinkedData]);

    const shapes = getClassesInCatalog();

    // Single initial fetch to load LD list if doInitialFetch is true and only when shapes are loaded
    useEffect(() => {
        if (doInitialFetch && !initialFetchDone && shapes && shapes.length > 0) {
            setQuery('*');
            setInitialFetchDone(true);
        }
    }, [shapes, doInitialFetch, initialFetchDone, searchLinkedData]);

    const availableTypes = shapes.map(type => {
        const targetClass = getFirstPredicateId(type, SHACL_TARGET_CLASS);
        const label = getLabel(type);
        return {targetClass, label};
    });

    return {
        query,
        selectedTypes,
        size,
        page,
        setQuery,
        setSelectedTypes,
        setPage,
        setSize,

        availableTypes,
        shapes,
        shapesLoading,

        searchPending,
        error: shapesError || searchError,
        entities,
        total,
        hasHighlights,
    };
};

export default useLinkedDataSearch;
