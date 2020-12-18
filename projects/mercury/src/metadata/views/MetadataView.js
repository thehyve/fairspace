import React, {useContext, useEffect} from 'react';
import {Button, Grid, withStyles} from '@material-ui/core';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {Assignment} from "@material-ui/icons";
import {useHistory} from "react-router-dom";
import Facet from './MetadataViewFacetFactory';
import type {MetadataViewFacet, MetadataViewOptions} from "./MetadataViewAPI";
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
    ofRangeValueType
} from "./metadataViewUtils";
import MetadataViewActiveFilters from "./MetadataViewActiveFilters";
import MetadataViewInformationDrawer from "./MetadataViewInformationDrawer";
import {useSingleSelection} from "../../file/UseSelection";
import * as consts from "../../constants";
import {TabPanel} from "../../workspaces/WorkspaceOverview";
import LoadingInlay from "../../common/components/LoadingInlay";
import MessageDisplay from "../../common/components/MessageDisplay";
import MetadataViewTableContainer from "./MetadataViewTableContainer";

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

export const CENTRAL_PANEL_WIDTH = '70%';
export const RIGHT_PANEL_WIDTH = '30%';

const styles = (theme) => ({
    facet: {
        borderColor: theme.palette.info.light,
        borderWidth: 1.5,
        borderRadius: 6
    },
    facets: {
        marginTop: 10,
        minWidth: 280,
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
        overflowY: 'auto'
    },
    centralPanel: {
        width: CENTRAL_PANEL_WIDTH,
        overflowX: 'auto',
    },
    centralPanelFullWidth: {
        width: '100%'
    },
    sidePanel: {
        width: RIGHT_PANEL_WIDTH
    },
    metadataViewTabs: {
        marginTop: 10,
        overflowX: 'auto',
        width: '100%',
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
    },
    tab: {
        '& .MuiBox-root': {
            padding: 0,
        },
    },
});

export const MetadataView = (props: MetadataViewProperties) => {
    const {views, facets, currentViewName, locationContext, classes, handleViewChangeRedirect, filters} = props;

    const currentViewIndex = Math.max(0, views.map(v => v.name).indexOf(currentViewName));
    const currentView = views[currentViewIndex];

    const {updateFilters, clearFilter, clearAllFilters, setLocationFilter} = useContext(MetadataViewContext);
    const {toggle, selected} = useSingleSelection();

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

    // Facet filter not to use both location context and location related facet values
    const locationFilter = (facet: MetadataViewFacet) => !locationContext || !LOCATION_RELATED_FACETS.includes(facet.name);

    const renderFacets = () => (
        <Grid container item direction="column" justify="flex-start" spacing={1}>
            {facets.filter(locationFilter).map(facet => {
                const facetOptions = ofRangeValueType(facet.type) ? [facet.min, facet.max] : facet.values;
                const activeFilter = filters.find(filter => filter.field === facet.name);
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
                            onChange={(values) => updateFilters(facet, values)}
                            extraClasses={classes.facet}
                            activeFilterValues={activeFilterValues}
                            clearFilter={() => clearFilter(facet.name)}
                        />
                    </Grid>
                );
            })}
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
                        columns={view.columns}
                        view={view.name}
                        filters={filters}
                        locationContext={locationContext}
                        selected={selected}
                        toggleRow={toggleRow}
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
            {filters && filters.find(f => f.name === LOCATION_FILTER_FIELD) && (
                <Grid container direction="row" spacing={1}>
                    <Grid item>
                        <Button data-testid="clear-button" onClick={() => clearAllFilters()} color="primary">
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
