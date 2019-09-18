import React, {useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {BreadCrumbs, usePageTitleUpdater} from '@fairspace/shared-frontend';
import LinkedDataCreator from "./LinkedDataCreator";
import LinkedDataContext from '../LinkedDataContext';
import LinkedDataOverviewHeader from "./LinkedDataOverviewHeader";
import useLinkedDataSearchParams from "../UseLinkedDataSearchParams";
import {getFirstPredicateId} from "../../common/utils/linkeddata/jsonLdUtils";
import {SHACL_TARGET_CLASS} from "../../constants";
import {getLabel} from "../../common/utils/linkeddata/metadataUtils";
import PropTypes from "prop-types";

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=` + encodeURIComponent(id);

const LinkedDataOverviewPage = ({history, title, resultsComponent: ResultsComponent}) => {
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

            onOpen={(id) => history.push(getEntityRelativeUrl(editorPath, id))}
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
                        shapes={getClassesInCatalog()}
                        requireIdentifier={requireIdentifier}
                        onCreate={({subject}) => history.push(getEntityRelativeUrl(editorPath, subject))}
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
}

export default withRouter(LinkedDataOverviewPage);
