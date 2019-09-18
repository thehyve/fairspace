import React from "react";
import useLinkedDataSearch from "../UseLinkedDataSearch";

export default ({
    selectedTypes,
    query,
    size, setSize,
    page, setPage,
    availableTypes,

    shapesLoading = false,
    shapesError = false,

    onOpen,
    listComponent: ListComponent
}) => {
    const {
        searchPending, searchError,
        items, total, hasHighlights,
    } = useLinkedDataSearch(selectedTypes, query, size, page, availableTypes);

    return (
        <ListComponent
            pending={shapesLoading || searchPending}
            error={shapesError || searchError}
            isSearching={query && query !== '*'}
            items={items}
            total={total}
            hasHighlights={hasHighlights}
            size={size}
            setSize={setSize}
            page={page}
            setPage={setPage}
            onOpen={onOpen}
        />
    );
};
