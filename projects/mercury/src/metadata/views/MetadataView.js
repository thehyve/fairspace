import React, {useContext, useEffect, useState} from 'react';
import {Button, Grid, Paper, withStyles} from '@material-ui/core';
import MetadataViewTable from './MetadataViewTable';
import Facet from './MetadataViewFacetFactory';
import type {MetadataViewFacet, MetadataViewFilter, ValueType} from "./MetadataViewAPI";
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


type MetadataViewProperties = {
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
    metadataViewTable: {
        marginTop: 10,
        overflowX: 'auto',
        width: '100%',
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
    }
});

export const MetadataView = (props: MetadataViewProperties) => {
    const {view: currentView, classes} = props;
    const {views = [], facets = []} = useContext(MetadataViewContext);
    const currentViewOptions = views.find(v => v.name === currentView) || {};
    const locationContext = getSearchContextFromString(window.location.search);
    const {toggle, selected} = useSingleSelection();

    const [filters: MetadataViewFilter[], setFilters] = useState([]);
    const [preselected: string[], setPreselected] = useState([]); // TODO use for preselection of values per facet

    useEffect(() => {
        if (isCollectionView(currentView)) {
            const newFilter: MetadataViewFilter = {
                field: LOCATION_FILTER_FIELD,
                values: [locationContext]
            };
            setFilters([...filters, newFilter]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentView, locationContext]);

    const toggleRow = (entity: MetadataViewEntity) => (toggle(entity));

    const getPathSegments = () => {
        if (isCollectionView(currentView)) {
            return getSearchPathSegments(locationContext);
        }
        return [];
    };

    const getBreadcrumbSegmentPath = () => {
        if (isCollectionView(currentView)) {
            return `/${currentView}`;
        }
        return `/views/${currentView}`;
    };

    const clearFilters = () => {
        setFilters([]);
        setPreselected([]);
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

    const renderFacets = () => (
        <Grid container item direction="column" justify="flex-start" spacing={1}>
            {
                facets.map(facet => {
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
                                preselected={preselected}
                            />
                        </Grid>
                    );
                })
            }
        </Grid>
    );

    return (
        <BreadcrumbsContext.Provider value={{
            segments: [
                {
                    label: currentViewOptions.title,
                    href: getBreadcrumbSegmentPath(),
                    icon: currentViewOptions.icon
                }
            ]
        }}
        >
            <BreadCrumbs additionalSegments={getPathSegments()} />
            {filters && filters.length > 0 && (
                <Grid container direction="row" spacing={1}>
                    <Grid item><Button onClick={() => clearFilters()} color="primary">Clear all</Button></Grid>
                    <Grid item><MetadataViewActiveFilters facets={facets} filters={filters} /></Grid>
                </Grid>
            )}
            <Grid container direction="row" spacing={1} wrap="nowrap">
                <Grid item className={`${classes.centralPanel} ${!selected && classes.centralPanelFullWidth}`}>
                    <Grid container direction="row" spacing={1} wrap="nowrap">
                        <Grid item className={classes.facets}>
                            {renderFacets()}
                        </Grid>
                        <Grid item className={classes.metadataViewTable}>
                            <Paper>
                                <MetadataViewTable
                                    columns={currentViewOptions.columns}
                                    view={currentView}
                                    filters={filters}
                                    locationContext={locationContext}
                                    selected={selected}
                                    toggleRow={toggleRow}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={classes.sidePanel} hidden={!selected}>
                    <MetadataViewInformationDrawer
                        forceExpand
                        showLinkedFiles={!isCollectionView(currentView)}
                        entity={selected}
                        viewIcon={currentViewOptions.icon}
                        locationContext={locationContext}
                    />
                </Grid>
            </Grid>
        </BreadcrumbsContext.Provider>
    );
};

export default withStyles(styles)(MetadataView);
