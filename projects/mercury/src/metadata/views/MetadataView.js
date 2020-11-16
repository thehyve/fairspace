import React, {useContext, useEffect, useState} from 'react';
import {Grid, Paper, withStyles} from '@material-ui/core';
import MetadataViewTable from './MetadataViewTable';
import Facet from './MetadataViewFacetFactory';
import type {MetadataViewFacet, MetadataViewFilter, ValueType} from "./MetadataViewAPI";
import MetadataViewAPI from './MetadataViewAPI';
import BreadCrumbs from '../common/components/BreadCrumbs';
import useAsync from "../common/hooks/UseAsync";
import MetadataViewContext from "./MetadataViewContext";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import {getSearchPathSegments} from "../collections/collectionUtils";
import {getSearchContextFromString} from "../search/searchUtils";
import {isCollectionView, LOCATION_FILTER_FIELD, ofRangeValueType} from "./metadataViewUtils";
import MetadataViewActiveFilters from "./MetadataViewActiveFilters";


type MetadataViewProperties = {
    view: string;
    classes: any;
}

const styles = (theme) => ({
    facet: {
        borderColor: theme.palette.info.light,
        borderWidth: 2,
        borderRadius: 6
    }
});

export const MetadataView = (props: MetadataViewProperties) => {
    const {view: currentView, classes} = props;
    const {views} = useContext(MetadataViewContext);
    const currentViewOptions = views.find(v => v.name === currentView) || {};
    const locationContext = getSearchContextFromString(window.location.search);

    const {data: facets = [], error: facetsError, loading: facetsLoading} = useAsync(
        () => MetadataViewAPI.getFacets(currentView)
    );

    const [filters: MetadataViewFilter[], setFilters] = useState([]);

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

    const setFilterValues = (type: ValueType, filter: MetadataViewFilter, values: any[]) => {
        if (ofRangeValueType(type)) {
            [filter.rangeStart, filter.rangeEnd] = values;
        } else {
            filter.values = values;
        }
    };

    const updateFilters = (facet: MetadataViewFacet, values: any[]) => {
        if (filters.find(f => f.field === facet.name)) {
            const updatedFilters = [...filters];
            const filter = updatedFilters.find(f => (f.field === facet.name));
            setFilterValues(facet.type, filter, values);
            setFilters(updatedFilters);
        } else {
            const newFilter: MetadataViewFilter = {
                field: facet.name
            };
            setFilterValues(facet.type, newFilter, values);
            setFilters([...filters, newFilter]);
        }
    };

    const getPathSegments = () => {
        if (isCollectionView(currentView)) {
            return getSearchPathSegments(locationContext);
        }
        return [];
    };

    const renderFacets = () => {
        if (facetsLoading) {
            return <LoadingInlay />;
        }

        if (!facetsLoading && facetsError && facetsError.message) {
            return <MessageDisplay message={facetsError.message} />;
        }
        return (
            <Grid
                container
                item
                direction="row"
                justify="flex-start"
                alignItems="stretch"
                spacing={1}
            >
                {
                    facets.map(facet => (
                        <Grid key={facet.name} item>
                            <Facet
                                multiple
                                type={facet.type}
                                title={facet.title}
                                options={facet.values || [facet.rangeStart, facet.rangeEnd]}
                                onChange={(values) => updateFilters(facet, values)}
                                extraClasses={classes.facet}
                            />
                        </Grid>
                    ))
                }
            </Grid>
        );
    };

    const getBreadcrumbSegmentPath = () => {
        if (isCollectionView(currentView)) {
            return `/${currentView}`;
        }
        return `/views/${currentView}`;
    };

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
            <Grid
                container
                direction="column"
                spacing={1}
            >
                {renderFacets()}
                <MetadataViewActiveFilters facets={facets} filters={filters} />
            </Grid>
            <Paper style={{marginTop: 10, overflowX: 'auto'}}>
                <MetadataViewTable columns={currentViewOptions.columns} view={currentView} filters={filters} locationContext={locationContext} />
            </Paper>
        </BreadcrumbsContext.Provider>
    );
};

export default withStyles(styles)(MetadataView);
