import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { Button, Grid, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Assignment, Close } from '@mui/icons-material';
import queryString from 'query-string';

import styles from './MetadataView.styles';
import type { MetadataViewFacet, MetadataViewFilter, MetadataViewOptions, ValueType } from './MetadataViewAPI';
import BreadCrumbs from '../../common/components/BreadCrumbs';
import MetadataViewContext from './MetadataViewContext';
import BreadcrumbsContext from '../../common/contexts/BreadcrumbsContext';
import { getLocationContextFromString, getMetadataViewNameFromString } from '../../search/searchUtils';
import type { MetadataViewEntity } from './metadataViewUtils';
import { getMetadataViewsPath, ofBooleanValueType, ofRangeValueType, ofNumericValueType, RESOURCES_VIEW } from './metadataViewUtils';
import MetadataViewActiveFacetFilters from './MetadataViewActiveFacetFilters';
import MetadataViewInformationDrawer from './MetadataViewInformationDrawer';
import { useSingleSelection } from '../../file/UseSelection';
import LoadingInlay from '../../common/components/LoadingInlay';
import MessageDisplay from '../../common/components/MessageDisplay';
import MetadataViewFacets from './MetadataViewFacets';
import MetadataViewTabs from './MetadataViewTabs';

import CollectionsContext from '../../collections/CollectionsContext';
import { getParentPath, getPathFromIri } from '../../file/fileUtils';
import usePageTitleUpdater from '../../common/hooks/UsePageTitleUpdater';
import MetadataViewFacetsContext from './MetadataViewFacetsContext';
import { accessLevelForCollection } from '../../collections/collectionUtils';

type ContextualMetadataViewProperties = {
    classes: any;
}

type MetadataViewProperties = ContextualMetadataViewProperties & {
    facets: MetadataViewFacet[];
    views: MetadataViewOptions[];
    filters: MetadataViewFilter[];
    locationContext: string;
    currentViewName: string;
    pathPrefix: string;
    handleViewChangeRedirect: () => {};
}

export const MetadataView = (props: MetadataViewProperties) => {
    const { views, facets, filters, currentViewName, locationContext, classes, handleViewChangeRedirect, pathPrefix } = props;

    usePageTitleUpdater('Metadata');

    const { collections } = useContext(CollectionsContext);
    const { toggle, selected } = useSingleSelection();

    const { updateFilters, clearFilter, clearAllFilters } = useContext(MetadataViewContext);
    const [filterCandidates, setFilterCandidates] = useState([]);
    const [textFiltersObject, setTextFiltersObject] = useState({});
    const [isClosedPanel, setIsClosedPanel] = useState(true);

    const toggleRow = useCallback((entity: MetadataViewEntity) => {
        setIsClosedPanel(!entity);
        toggle(entity);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentViewIndex = Math.max(0, views.map(v => v.name).indexOf(currentViewName));
    const currentView = views[currentViewIndex];
    const currentViewIdColumn = currentView.columns.find(c => c.type === 'Identifier' && c.name === currentView.name);

    const changeTab = useCallback((event, tabIndex) => {
        setIsClosedPanel(true);
        toggle();
        setTextFiltersObject({});
        handleViewChangeRedirect(views[tabIndex].name, pathPrefix);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [views]);

    const clearFilterCandidates = useCallback(() => {
        setFilterCandidates([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCandidates]);

    const applyFilters = useCallback(() => {
        updateFilters(filterCandidates);
        clearFilterCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCandidates, updateFilters]);

    const setFilterValues = (type: ValueType, filter: MetadataViewFilter, values: any[]) => {
        if (ofRangeValueType(type)) {
            [filter.min, filter.max] = values;
            filter.numericValue = ofNumericValueType(type);
        } else if (ofBooleanValueType(type)) {
            filter.booleanValue = values.length > 0 ? values[0] : null;
        } else {
            filter.values = values;
        }
    };

    const updateFilterCandidates = useCallback((facet: MetadataViewFacet, newValues: any[]) => {
        if (filterCandidates.find(f => f.field === facet.name)) {
            let updatedFilters;
            const existingFilter = filters.find(f => f.field === facet.name);
            if (!newValues || (existingFilter && existingFilter.values && _.isEqual(existingFilter.values.sort(), newValues.sort()) && (
                (newValues.filter(v => v !== null).length === 0) || existingFilter.value))) {
                updatedFilters = [...filterCandidates.filter(f => f.field !== facet.name)];
            } else {
                updatedFilters = [...filterCandidates];
                const filter = updatedFilters.find(f => (f.field === facet.name));
                setFilterValues(facet.type, filter, newValues);
            }
            setFilterCandidates(updatedFilters);
        } else if (newValues) {
            const newFilter: MetadataViewFilter = {
                field: facet.name,
            };
            setFilterValues(facet.type, newFilter, newValues);
            setFilterCandidates([...filterCandidates, newFilter]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCandidates]);

    const handleClearAllFilters = () => {
        setFilterCandidates([]);
        setTextFiltersObject({});
        clearAllFilters();
    };

    const handleClearFilter = useCallback((facetName: string) => {
        setFilterCandidates([...filterCandidates.filter(f => f.field !== facetName)]);
        clearFilter(facetName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCandidates]);

    const collectionsFacet = useMemo(
        () => (
            !locationContext && collections && {
                name: 'location',
                title: 'Collection',
                type: 'Term',
                values: collections.map(c => ({ value: c.iri, label: c.name, access: accessLevelForCollection(c) })),
            }),
        [locationContext, collections],
    );

    const facetsEx = useMemo(
        () => (collectionsFacet ? [...facets, collectionsFacet] : facets),
        [collectionsFacet, facets],
    );

    const getPathSegments = () => {
        const segments = ((locationContext && getPathFromIri(locationContext)) || '').split('/');
        const result = [];
        if (segments[0] === '') {
            return result;
        }

        const prefix = getMetadataViewsPath(RESOURCES_VIEW) + '&context=';
        let path = locationContext;
        segments.reverse().forEach(segment => {
            result.push({ label: segment, href: (prefix + encodeURIComponent(path)) });
            path = getParentPath(path);
        });
        return result.reverse();
    };

    const areFacetFiltersNonEmpty = useMemo(
        () => (filters && filters.some(filter => facetsEx.some(facet => facet.name === filter.field))),
        [filters, facetsEx],
    );
    const areTextFiltersNonEmpty = useMemo(
        () => (textFiltersObject && Object.keys(textFiltersObject).length > 0),
        [textFiltersObject],
    );

    const getPrefilteringRedirectionLink = () => {
        if (!selected) {
            return '';
        }
        const metadataURL = window.location.host + getMetadataViewsPath(currentView.name, pathPrefix);
        const prefilteringQueryString = queryString.stringify({
            view: currentView.name,
            [currentViewIdColumn.name.toLowerCase()]: selected.label,
        });
        return metadataURL + '?' + prefilteringQueryString;
    };

    return (
        <BreadcrumbsContext.Provider value={{
            segments: [{ label: 'Metadata', href: getMetadataViewsPath(currentView.name, pathPrefix), icon: <Assignment /> }],
        }}
        >
            <BreadCrumbs additionalSegments={getPathSegments(locationContext)} />
            {(areFacetFiltersNonEmpty || areTextFiltersNonEmpty) && (
                <Grid container justifyContent="space-between" direction="row-reverse">
                    <Grid item xs={2} className={classes.clearAllButtonContainer}>
                        <Button className={classes.clearAllButton} startIcon={<Close />} onClick={handleClearAllFilters}>
                            Clear all filters
                        </Button>
                    </Grid>
                    {areFacetFiltersNonEmpty && (
                        <Grid item container xs alignItems="center" spacing={1} className={classes.activeFilters}>
                            <Grid item>
                                <Typography variant="overline" component="span" color="textSecondary">Active filters:</Typography>
                            </Grid>
                            <Grid item>
                                <MetadataViewActiveFacetFilters facets={facetsEx} filters={filters} setFilters={updateFilters} />
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            )}
            <Grid container direction="row" spacing={1} wrap="nowrap">
                <Grid item className={`${classes.overallPanel} ${isClosedPanel && classes.overallPanelFullWidth}`}>
                    <Grid container direction="row" spacing={1} wrap="nowrap">
                        <Grid item className={classes.leftPanel}>
                            <MetadataViewFacets
                                views={views}
                                filters={filters}
                                facetsEx={facetsEx}
                                clearFilterCandidates={clearFilterCandidates}
                                filterCandidates={filterCandidates}
                                updateFilterCandidates={updateFilterCandidates}
                                handleClearFilter={handleClearFilter}
                                applyFilters={applyFilters}
                            />
                        </Grid>
                        <Grid item className={classes.centralPanel}>
                            <MetadataViewTabs
                                currentViewIndex={currentViewIndex}
                                idColumn={currentViewIdColumn}
                                changeTab={changeTab}
                                views={views}
                                filters={filters}
                                locationContext={locationContext}
                                selected={selected}
                                toggleRow={toggleRow}
                                hasInactiveFilters={filterCandidates.length > 0}
                                collections={collections}
                                textFiltersObject={textFiltersObject}
                                setTextFiltersObject={setTextFiltersObject}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={classes.rightPanel} hidden={isClosedPanel}>
                    <MetadataViewInformationDrawer
                        handleCloseCard={() => setIsClosedPanel(true)}
                        entity={selected}
                        viewIcon={<Assignment />}
                        textFilterLink={getPrefilteringRedirectionLink(selected)}
                    />
                </Grid>
            </Grid>
        </BreadcrumbsContext.Provider>
    );
};

export const ContextualMetadataView = (props: ContextualMetadataViewProperties) => {
    const { views = [], filters, loading, error } = useContext(MetadataViewContext);
    const { facets = [], facetsLoading, facetsError, initialLoad } = useContext(MetadataViewFacetsContext);
    const currentViewName = getMetadataViewNameFromString(window.location.search);
    const locationContext = getLocationContextFromString(window.location.search);
    const history = useHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { initialLoad(); }, []);

    if ((error && error.message)) {
        return <MessageDisplay message={error.message} />;
    }
    if (facetsError && facetsError.message) {
        return <MessageDisplay message={facetsError.message} />;
    }
    if (loading || facetsLoading) {
        return <LoadingInlay />;
    }

    if (views.length < 1) {
        return <MessageDisplay message="No metadata view found." />;
    }

    const handleViewChangeRedirect = (viewName, viewPath) => {
        if (viewName) {
            history.push(getMetadataViewsPath(viewName, viewPath));
        }
    };

    return (
        <MetadataView
            {...props}
            facets={facets}
            views={views}
            filters={filters}
            locationContext={currentViewName === RESOURCES_VIEW && locationContext}
            currentViewName={currentViewName}
            handleViewChangeRedirect={handleViewChangeRedirect}
        />
    );
};

export default withStyles(styles)(ContextualMetadataView);
