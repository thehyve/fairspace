import React, {useContext, useState, useEffect} from 'react';
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {Grid} from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import {BreadCrumbs, usePageTitleUpdater} from '@fairspace/shared-frontend';

import LinkedDataCreator from "./LinkedDataCreator";
import LinkedDataContext from '../LinkedDataContext';
import LinkedDataOverviewHeader from "./LinkedDataOverviewHeader";
import useLinkedDataSearchParams from "../UseLinkedDataSearchParams";
import {getFirstPredicateId} from "../../common/utils/linkeddata/jsonLdUtils";
import {SHACL_TARGET_CLASS} from "../../constants";
import {getLabel} from "../../common/utils/linkeddata/metadataUtils";

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=` + encodeURIComponent(id);

const LinkedDataOverviewPage = ({history, title, resultsComponent: ResultsComponent, showGraphSelection = false}) => {
    const {
        requireIdentifier, editorPath,
        hasEditRight, getClassesInCatalog, shapesLoading, shapesError
    } = useContext(LinkedDataContext);

    const {
        query, setQuery, selectedTypes, setSelectedTypes,
        size, setSize, page, setPage
    } = useLinkedDataSearchParams();

    const [showGraph, setShowGraph] = useState(true);

    useEffect(() => {
        if (query || (selectedTypes && selectedTypes.length > 0)) {
            setShowGraph(false);
        }
    }, [query, selectedTypes]);

    useEffect(() => {
        if (showGraph) {
            setSelectedTypes([]);
            setQuery(null);
        }
    }, [setQuery, setSelectedTypes, showGraph]);

    const availableTypes = getClassesInCatalog().map(type => {
        const targetClass = getFirstPredicateId(type, SHACL_TARGET_CLASS);
        const label = getLabel(type);
        return {targetClass, label};
    });

    usePageTitleUpdater(title);

    const renderResults = () => (
        <ResultsComponent
            showGraph={showGraph}
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
            {showGraphSelection ? (
                <Grid container justify="space-between" alignItems="center">
                    <Grid item xs={9}>
                        <LinkedDataOverviewHeader
                            setQuery={setQuery}
                            selectedTypes={selectedTypes}
                            setSelectedTypes={setSelectedTypes}
                            availableTypes={availableTypes}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <ToggleButton
                            color="primary"
                            selected={showGraph}
                            value
                            onChange={() => setShowGraph(!showGraph)}
                        >
                            Show Graph
                        </ToggleButton>
                    </Grid>
                </Grid>
            ) : (
                <LinkedDataOverviewHeader
                    setQuery={setQuery}
                    selectedTypes={selectedTypes}
                    setSelectedTypes={setSelectedTypes}
                    availableTypes={availableTypes}
                />
            )}
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
};

export default withRouter(LinkedDataOverviewPage);
