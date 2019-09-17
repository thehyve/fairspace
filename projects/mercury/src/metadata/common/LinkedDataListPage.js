import React, {useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {BreadCrumbs, LoadingInlay, MessageDisplay, usePageTitleUpdater} from '@fairspace/shared-frontend';

import useLinkedDataSearch from '../UseLinkedDataSearch';
import LinkedDataCreator from "./LinkedDataCreator";
import LinkedDataContext from '../LinkedDataContext';
import LinkedDataListHeader from "./LinkedDataListHeader";
import useLinkedDataSearchParams from "../UseLinkedDataSearchParams";
import {getFirstPredicateId} from "../../common/utils/linkeddata/jsonLdUtils";
import {SHACL_TARGET_CLASS} from "../../constants";
import {getLabel} from "../../common/utils/linkeddata/metadataUtils";

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=` + encodeURIComponent(id);

const LinkedDataListPage = ({history, title, listComponent: ListComponent}) => {
    const {
        requireIdentifier, editorPath,
        hasEditRight, getClassesInCatalog, shapesLoading, shapesError
    } = useContext(LinkedDataContext);

    const {
        query, setQuery, selectedTypes, setSelectedTypes,
        size, setSize, page, setPage
    } = useLinkedDataSearchParams();

    const availableTypes = getClassesInCatalog().map(type => {
        const targetClass = getFirstPredicateId(type, SHACL_TARGET_CLASS);
        const label = getLabel(type);
        return {targetClass, label};
    });

    const {
        searchPending, searchError,
        items, total, hasHighlights,
    } = useLinkedDataSearch(selectedTypes, query, size, page, availableTypes);

    usePageTitleUpdater(title);

    const ListBody = () => {
        if (shapesLoading || searchPending) {
            return <LoadingInlay />;
        }

        if (shapesError) {
            return <MessageDisplay message={shapesError.message || 'An error occurred while loading the shapes'} />;
        }

        if (searchError) {
            return <MessageDisplay message={searchError.message || 'An error occurred while loading metadata'} />;
        }

        if (items && items.length > 0) {
            return (
                <ListComponent
                    items={items}
                    total={total}
                    hasHighlights={hasHighlights}
                    size={size}
                    setSize={setSize}
                    page={page}
                    setPage={setPage}
                    onOpen={(id) => history.push(getEntityRelativeUrl(editorPath, id))}
                />
            );
        }

        return <MessageDisplay message={query && query !== '*' ? 'No results found' : 'The metadata is empty'} isError={false} />;
    };

    return (
        <>
            <BreadCrumbs />
            <LinkedDataListHeader
                setQuery={setQuery}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                availableTypes={availableTypes}
            />

            {
                hasEditRight ? (
                    <LinkedDataCreator
                        shapesLoading={shapesLoading}
                        shapesError={shapesError}
                        shapes={getClassesInCatalog()}
                        requireIdentifier={requireIdentifier}
                        onCreate={({subject}) => history.push(getEntityRelativeUrl(editorPath, subject))}
                    >
                        <ListBody />
                    </LinkedDataCreator>
                ) : <ListBody />
            }
        </>
    );
};

export default withRouter(LinkedDataListPage);
