import React, {useContext, useEffect, useState} from 'react';
import {Button, Grid, withStyles} from '@material-ui/core';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {Assignment} from "@material-ui/icons";
import MetadataViewTable from './MetadataViewTable';
import Facet from './MetadataViewFacetFactory';
import type {MetadataViewFacet, MetadataViewFilter, MetadataViewOptions, ValueType} from "./MetadataViewAPI";
import BreadCrumbs from '../../common/components/BreadCrumbs';
import MetadataViewContext from "./MetadataViewContext";
import BreadcrumbsContext from "../../common/contexts/BreadcrumbsContext";
import {getSearchPathSegments} from "../../collections/collectionUtils";
import {getSearchContextFromString} from "../../search/searchUtils";
import type {MetadataViewEntity} from "./metadataViewUtils";
import {isCollectionView, LOCATION_FILTER_FIELD, ofRangeValueType} from "./metadataViewUtils";
import MetadataViewActiveFilters from "./MetadataViewActiveFilters";
import MetadataViewInformationDrawer from "./MetadataViewInformationDrawer";
import {useSingleSelection} from "../../file/UseSelection";
import * as consts from "../../constants";
import {TabPanel} from "../../workspaces/WorkspaceOverview";
import LoadingInlay from "../../common/components/LoadingInlay";
import MessageDisplay from "../../common/components/MessageDisplay";


type MetadataViewProperties = {
    classes: any;
    facets: MetadataViewFacet[];
    views: MetadataViewOptions[];
    locationContext: string;
}

type ContextualMetadataViewProperties = {
    view: string;
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
    const {views, facets, locationContext, classes} = props;

    const {toggle, selected} = useSingleSelection();
    const [selectedTab, setSelectedTab] = useState(0);
    const currentViewTab = views[selectedTab];
    const isCurrentViewCollectionView = isCollectionView(currentViewTab.name);
    const [filters: MetadataViewFilter[], setFilters] = useState([]);

    useEffect(() => {
        if (isCurrentViewCollectionView) {
            const newFilter: MetadataViewFilter = {
                field: LOCATION_FILTER_FIELD,
                values: [locationContext]
            };
            setFilters([...filters, newFilter]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentViewTab.name, locationContext]);

    const toggleRow = (entity: MetadataViewEntity) => (toggle(entity));

    const getPathSegments = () => {
        if (isCurrentViewCollectionView) {
            return getSearchPathSegments(locationContext);
        }
        return [];
    };

    const getBreadcrumbSegmentPath = () => {
        if (isCurrentViewCollectionView) {
            return `/${currentViewTab.title}`;
        }
        return `/metadata-views`;
    };

    const a11yProps = (index) => ({
        'key': `metadata-view-tab-${index}`,
        'aria-controls': `metadata-view-tab-${index}`,
    });

    const changeTab = (event, tabIndex) => {
        setSelectedTab(tabIndex);
    };

    const setFilterValues = (type: ValueType, filter: MetadataViewFilter, values: any[]) => {
        if (ofRangeValueType(type)) {
            [filter.min, filter.max] = values;
        } else {
            filter.values = values;
        }
    };

    const updateFilters = (facet: MetadataViewFacet, values: any[]) => {
        if (filters.find(f => f.field === facet.name)) {
            let updatedFilters;
            if (values && values.length > 0 && !values.every(v => !v)) {
                updatedFilters = [...filters];
                const filter = updatedFilters.find(f => (f.field === facet.name));
                setFilterValues(facet.type, filter, values);
            } else {
                updatedFilters = [...filters.filter(f => f.field !== facet.name)];
            }
            setFilters(updatedFilters);
        } else {
            const newFilter: MetadataViewFilter = {
                field: facet.name
            };
            setFilterValues(facet.type, newFilter, values);
            setFilters([...filters, newFilter]);
        }
    };

    const clearFilter = (facetName: string) => {
        setFilters([...filters.filter(f => f.field !== facetName)]);
    };

    const clearFilters = () => {
        setFilters([]);
    };

    const renderFacets = () => (
        <Grid container item direction="column" justify="flex-start" spacing={1}>
            {facets.map(facet => {
                const facetOptions = ofRangeValueType(facet.type) ? [facet.min, facet.max] : facet.values;
                return facetOptions && facetOptions.length > 0 && (
                    <Grid key={facet.name} item>
                        <Facet
                            multiple
                            type={facet.type}
                            title={facet.title}
                            options={facetOptions || []}
                            onChange={(values) => updateFilters(facet, values)}
                            extraClasses={classes.facet}
                            active={filters.some(filter => filter.field === facet.name)}
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
                value={selectedTab}
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
                <TabPanel value={selectedTab} index={index} {...a11yProps(index)} className={classes.tab}>
                    <MetadataViewTable
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
            segments: [
                {label: "Metadata views", href: getBreadcrumbSegmentPath(), icon: <Assignment />}
            ]
        }}
        >
            <BreadCrumbs additionalSegments={getPathSegments()} />
            {filters && filters.length > 0 && (
                <Grid container direction="row" spacing={1}>
                    <Grid item><Button data-testid="clear-button" onClick={() => clearFilters()} color="primary">Clear all</Button></Grid>
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
                        showLinkedFiles={!isCurrentViewCollectionView}
                        entity={selected}
                        viewIcon=<Assignment />
                        locationContext={locationContext}
                    />
                </Grid>
            </Grid>
        </BreadcrumbsContext.Provider>
    );
};

export const ContextualMetadataView = (props: ContextualMetadataViewProperties) => {
    const {views: availableViews = [], loading, error, facets = []} = useContext(MetadataViewContext);
    const locationContext = getSearchContextFromString(window.location.search);
    const {view} = props;

    if (loading) {
        return <LoadingInlay />;
    }
    if (error && error.message) {
        return <MessageDisplay message={error.message} />;
    }
    const views = [];
    if (view) {
        if (availableViews.find(v => v.name === view)) {
            views.push(availableViews.find(v => v.name === view));
        }
    } else {
        views.push(...availableViews);
    }

    if (views.length < 1) {
        return <MessageDisplay message="No metadata view found." />;
    }

    return <MetadataView {...props} facets={facets} views={views} locationContext={locationContext} />;
};

export default withStyles(styles)(ContextualMetadataView);
