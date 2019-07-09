import {useState, useContext, useEffect} from 'react';

import LinkedDataContext from './LinkedDataContext';
import {getFirstPredicateId} from "../../utils/linkeddata/jsonLdUtils";
import {SEARCH_DEFAULT_SIZE, SHACL_TARGET_CLASS} from "../../constants";
import {getLabel} from "../../utils/linkeddata/metadataUtils";

const useLinkDataSearch = (doInitialFetch = false) => {
    const {
        getClassesInCatalog,
        searchLinkedData,
        shapesLoading,
        shapesError,
        getSearchEntities,
        requireIdentifier,
    } = useContext(LinkedDataContext);

    const [types, setTypes] = useState([]);
    const [query, setQuery] = useState('');
    const [size, setSize] = useState(SEARCH_DEFAULT_SIZE);
    const [page, setPage] = useState(0);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const {searchPending, searchError, entities, total, hasHighlights} = getSearchEntities();

    const shapes = getClassesInCatalog();

    useEffect(() => {
        if (doInitialFetch && !initialFetchDone && shapes && shapes.length > 0) {
            searchLinkedData({query: '*'});
            setInitialFetchDone(true);
        }
    }, [shapes, doInitialFetch, initialFetchDone, searchLinkedData]);

    const getSearchState = () => ({types, query, size, page});

    const onSearchChange = (q) => {
        setQuery(q);
        setPage(0); // reset page to start from first page
        searchLinkedData({...getSearchState(), page: 0, query: q});
    };

    const onTypesChange = (t) => {
        setTypes(t);
        searchLinkedData({...getSearchState(), types: t});
    };

    const onPageChange = (_, p) => {
        setPage(p);
        searchLinkedData({...getSearchState(), page: p});
    };

    const onSizeChange = (e) => {
        const s = e.target.value;
        setSize(s);
        setPage(0); // reset page to start from first page
        searchLinkedData({...getSearchState(), page: 0, size: s});
    };

    const allTypes = shapes.map(type => {
        const targetClass = getFirstPredicateId(type, SHACL_TARGET_CLASS);
        const label = getLabel(type);
        return {targetClass, label};
    });

    const getTypeLabel = (type) => allTypes.find(({targetClass}) => targetClass === type).label;

    return {
        types,
        shapes,
        allTypes,
        size,
        page,
        loading: shapesLoading || searchPending,
        error: shapesError || searchError,
        onSearchChange,
        onTypesChange,
        onPageChange,
        onSizeChange,
        getTypeLabel,
        entities,
        total,
        hasHighlights,
        requireIdentifier,
    };
};

export default useLinkDataSearch;
