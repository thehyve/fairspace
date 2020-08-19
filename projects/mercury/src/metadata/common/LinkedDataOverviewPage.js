import React, {useCallback, useContext} from 'react';
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import usePageTitleUpdater from "../../common/hooks/UsePageTitleUpdater";

import LinkedDataCreator from "./LinkedDataCreator";
import LinkedDataContext from '../LinkedDataContext';
import LinkedDataOverviewHeader from "./LinkedDataOverviewHeader";
import useLinkedDataSearchParams from "./UseLinkedDataSearchParams";
import {getFirstPredicateId} from "./jsonLdUtils";
import {METADATA_PATH, SHACL_TARGET_CLASS} from "../../constants";
import {getLabel} from "./metadataUtils";
import {getClassesInCatalog} from './vocabularyUtils';
import BreadCrumbs from "../../common/components/BreadCrumbs";

const getEntityRelativeUrl = (id) => `${METADATA_PATH}?iri=${encodeURIComponent(id)}`;

const LinkedDataOverviewPage = ({history, title, resultsComponent: ResultsComponent}) => {
    const {requireIdentifier, hasEditRight, shapes, shapesLoading, shapesError} = useContext(LinkedDataContext);

    const {
        query, setQuery, selectedTypes, setSelectedTypes,
        size, setSize, page, setPage
    } = useLinkedDataSearchParams();

    const getClassesInCatalogToDisplay = useCallback(() => getClassesInCatalog(shapes), [shapes]);

    const getAvailableTypes = useCallback(() => getClassesInCatalogToDisplay()
        .map(type => {
            const targetClass = getFirstPredicateId(type, SHACL_TARGET_CLASS) || type['@id'];
            const label = getLabel(type);
            return {targetClass, label};
        }), [getClassesInCatalogToDisplay]);

    const availableTypes = getAvailableTypes();

    usePageTitleUpdater(title);

    const renderResults = () => (
        <ResultsComponent
            selectedTypes={selectedTypes}
            availableTypes={availableTypes}

            query={query}
            size={size}
            setSize={setSize}
            page={page}
            setPage={setPage}

            shapesLoading={shapesLoading}
            shapesError={shapesError}

            onOpen={(id) => history.push(getEntityRelativeUrl(id))}
        />
    );

    return (
        <>
            <BreadCrumbs />
            <LinkedDataOverviewHeader
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
                        shapes={getClassesInCatalogToDisplay()}
                        requireIdentifier={requireIdentifier}
                        onCreate={({subject}) => history.push(getEntityRelativeUrl(subject))}
                    >
                        {renderResults()}
                    </LinkedDataCreator>
                ) : renderResults()
            }
        </>
    );
};

LinkedDataOverviewPage.propTypes = {
    title: PropTypes.string,
    resultsComponent: PropTypes.elementType.isRequired
};

export default withRouter(LinkedDataOverviewPage);
