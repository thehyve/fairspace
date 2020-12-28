import React, {useContext, useEffect, useState} from 'react';
import {Button, Grid, withStyles} from '@material-ui/core';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {Assignment} from "@material-ui/icons";
import {useHistory} from "react-router-dom";
import Facet from './MetadataViewFacetFactory';
import type {MetadataViewColumn, MetadataViewFacet, MetadataViewFilter, MetadataViewOptions, ValueType} from "./MetadataViewAPI";
import BreadCrumbs from '../../common/components/BreadCrumbs';
import MetadataViewContext from "./MetadataViewContext";
import BreadcrumbsContext from "../../common/contexts/BreadcrumbsContext";
import {getLocationContextFromString, getMetadataViewNameFromString} from "../../search/searchUtils";
import type {MetadataViewEntity} from "./metadataViewUtils";
import {
    getMetadataViewsPath,
    getPathSegments,
    LOCATION_FILTER_FIELD,
    LOCATION_RELATED_FACETS,
    isFilesView,
    ofRangeValueType
} from "./metadataViewUtils";
import MetadataViewActiveFilters from "./MetadataViewActiveFilters";
import MetadataViewInformationDrawer from "./MetadataViewInformationDrawer";
import {useSingleSelection} from "../../file/UseSelection";
import {TabPanel} from "../../workspaces/WorkspaceOverview";
import LoadingInlay from "../../common/components/LoadingInlay";
import MessageDisplay from "../../common/components/MessageDisplay";
import MetadataViewTableContainer from "./MetadataViewTableContainer";
import {isNonEmptyValue} from "../../common/utils/genericUtils";

import styles from "./MetadataView.styles";

type MetadataViewProperties = {
    classes: any;
    facets: MetadataViewFacet[];
    views: MetadataViewOptions[];
    locationContext: string;
    currentViewName: string;
    handleViewChangeRedirect: () => {};
}

type ContextualMetadataViewProperties = {
    classes: any;
}

export const MetadataView = (props: MetadataViewProperties) => {
    const {views, facets, currentViewName, locationContext, classes, handleViewChangeRedirect, filters} = props;

    const currentViewIndex = Math.max(0, views.map(v => v.name).indexOf(currentViewName));
    const currentView = views[currentViewIndex];

    const {updateFilters, clearFilter, clearAllFilters, setLocationFilter} = useContext(MetadataViewContext);
    const {toggle, selected} = useSingleSelection();
    const [filterCandidates, setFilterCandidates] = useState([]);

    // pass location filter to the API for files view
    useEffect(() => {
        setLocationFilter(currentViewName, locationContext);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationContext]);

    const toggleRow = (entity: MetadataViewEntity) => (toggle(entity));

    const a11yProps = (index) => ({
        'key': `metadata-view-tab-${index}`,
        'aria-controls': `metadata-view-tab-${index}`,
    });

    const changeTab = (event, tabIndex) => {
        toggle();
        handleViewChangeRedirect(views[tabIndex].name);
    };

    const applyFilters = () => {
        updateFilters(filterCandidates);
        setFilterCandidates([]);
    };

    const setFilterValues = (type: ValueType, filter: MetadataViewFilter, values: any[]) => {
        if (ofRangeValueType(type)) {
            [filter.min, filter.max] = values;
        } else {
            filter.values = values;
        }
    };

    const updateInactiveFilters = (facet: MetadataViewFacet, values: any[]) => {
        if (filterCandidates.find(f => f.field === facet.name)) {
            let updatedFilters;
            if (values && values.length > 0 && values.some(isNonEmptyValue)) {
                updatedFilters = [...filterCandidates];
                const filter = updatedFilters.find(f => (f.field === facet.name));
                setFilterValues(facet.type, filter, values);
            } else {
                updatedFilters = [...filterCandidates.filter(f => f.field !== facet.name)];
            }
            setFilterCandidates(updatedFilters);
        } else {
            const newFilter: MetadataViewFilter = {
                field: facet.name
            };
            setFilterValues(facet.type, newFilter, values);
            setFilterCandidates([...filterCandidates, newFilter]);
        }
    };

    const handleClearAllFilters = () => {
        setFilterCandidates([]);
        clearAllFilters();
    };

    const handleClearFilter = (facetName: string) => {
        setFilterCandidates([...filterCandidates.filter(f => f.field !== facetName)]);
        clearFilter(facetName);
    };

    // Facet filter not to use both location context and location related facet values
    const locationFilter = (facet: MetadataViewFacet) => !locationContext || !LOCATION_RELATED_FACETS.includes(facet.name);

    const appendCustomColumns = (columns: MetadataViewColumn[]) => {
        if (isFilesView(currentView.name)) {
            const accessColumn = {title: "Collection access", name: "Collection.access", type: "Custom"};
            return [...columns, accessColumn];
        }
        return columns;
    };

    const renderFacets = () => (
        <Grid container item direction="column" justify="flex-start" spacing={1}>
            {facets.filter(locationFilter).map(facet => {
                const facetOptions = ofRangeValueType(facet.type) ? [facet.min, facet.max] : facet.values;
                const activeFilter = [...filterCandidates, ...filters].find(filter => filter.field === facet.name);
                let activeFilterValues = [];
                if (activeFilter) {
                    activeFilterValues = ofRangeValueType(facet.type) ? [activeFilter.min, activeFilter.max] : activeFilter.values;
                }
                return facetOptions && facetOptions.length > 0 && (
                    <Grid key={facet.name} item>
                        <Facet
                            type={facet.type}
                            title={facet.title}
                            options={facetOptions}
                            onChange={(values) => updateInactiveFilters(facet, values)}
                            extraClasses={classes.facet}
                            activeFilterValues={activeFilterValues}
                            clearFilter={() => handleClearFilter(facet.name)}
                        />
                    </Grid>
                );
            })}
            <Button
                onClick={applyFilters}
                variant="contained"
                color="secondary"
                className={`${classes.confirmFiltersButtonBlock} ${filterCandidates.length > 0 && classes.confirmFiltersButtonBlockActive}`}
                disabled={filterCandidates.length === 0}
            >
                Apply filters
            </Button>
        </Grid>
    );

    const renderViewTabs = () => (
        <div>
            <Tabs
                value={currentViewIndex}
                onChange={changeTab}
                indicatorColor="primary"
                textColor="primary"
                aria-label="metadata view tabs"
            >
                {views.map((view, index) => (
                    <Tab label={view.title} {...a11yProps(index)} />
                ))}
            </Tabs>
            {views.map((view, index) => (
                <TabPanel value={currentViewIndex} index={index} {...a11yProps(index)} className={classes.tab}>
                    <MetadataViewTableContainer
                        columns={appendCustomColumns(view.columns)}
                        view={view.name}
                        filters={filters}
                        locationContext={locationContext}
                        selected={selected}
                        toggleRow={toggleRow}
                        hasInactiveFilters={filterCandidates.length > 0}
                    />
                </TabPanel>
            ))}
        </div>
    );

    return (
        <BreadcrumbsContext.Provider value={{
            segments: [{label: "Metadata views", href: getMetadataViewsPath(currentView.name), icon: <Assignment />}]
        }}
        >
            <BreadCrumbs additionalSegments={getPathSegments(locationContext)} />
            {filters && filters.some(f => f.field !== LOCATION_FILTER_FIELD) && (
                <Grid container direction="row" spacing={1}>
                    <Grid item>
                        <Button data-testid="clear-button" onClick={handleClearAllFilters} color="primary">
                            Clear all
                        </Button>
                    </Grid>
                    <Grid item><MetadataViewActiveFilters facets={facets} filters={filters} /></Grid>
                </Grid>
            )}
            <Grid container direction="row" spacing={1} wrap="nowrap">
                <Grid item className={`${classes.centralPanel} ${!selected && classes.centralPanelFullWidth}`}>
                    <Grid container direction="row" spacing={1} wrap="nowrap">
                        <Grid item className={classes.facets}>
                            {renderFacets()}
                        </Grid>
                        <Grid item className={classes.metadataViewTabs}>
                            {renderViewTabs()}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={classes.sidePanel} hidden={!selected}>
                    <MetadataViewInformationDrawer
                        forceExpand
                        entity={selected}
                        viewIcon=<Assignment />
                    />
                </Grid>
            </Grid>
        </BreadcrumbsContext.Provider>
    );
};

export const ContextualMetadataView = (props: ContextualMetadataViewProperties) => {
    const {views = [], loading, error, facets = [], filters} = useContext(MetadataViewContext);
    const currentViewName = getMetadataViewNameFromString(window.location.search);
    const locationContext = getLocationContextFromString(window.location.search);
    const history = useHistory();

    if (loading) {
        return <LoadingInlay />;
    }
    if (error && error.message) {
        return <MessageDisplay message={error.message} />;
    }

    if (views.length < 1) {
        return <MessageDisplay message="No metadata view found." />;
    }

    const handleViewChangeRedirect = (viewName) => {
        if (viewName) {
            history.push(getMetadataViewsPath(viewName));
        }
    };

    return (
        <MetadataView
            {...props}
            facets={facets}
            views={views}
            locationContext={locationContext}
            currentViewName={currentViewName}
            filters={filters}
            handleViewChangeRedirect={handleViewChangeRedirect}
        />
    );
};

export default withStyles(styles)(ContextualMetadataView);
