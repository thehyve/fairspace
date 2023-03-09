import React from 'react';
import withStyles from '@mui/styles/withStyles';
import {Button, Grid} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ofBooleanValueType, ofRangeValueType} from "./metadataViewUtils";
import Facet from './MetadataViewFacetFactory';
import type {MetadataViewFacet, MetadataViewFilter, MetadataViewOptions, ValueType} from "./MetadataViewAPI";

type MetadataViewFacetsProperties = {
    views: MetadataViewOptions[];
    filters: MetadataViewFilter[];
    facetsEx: MetadataViewFacet[];
    filterCandidates: MetadataViewFilter[];
    clearFilterCandidates: () => {};
    updateFilterCandidates: () => {};
    handleClearFilter: () => {};
    applyFilters: () => {};
    classes: any;
};

const styles = theme => ({
    confirmFiltersButtonBlock: {
        bottom: 0,
        marginTop: 8,
        marginLeft: 4,
        width: 253
    },
    confirmFiltersButtonBlockActive: {
        position: 'sticky',
        backgroundColor: alpha(theme.palette.common.white, 0.8)
    },
    confirmFiltersButton: {
        width: '100%'
    },
    facet: {
        borderColor: theme.palette.primary.light,
        borderWidth: 1.5,
        borderRadius: 6
    },
    facetHeaders: {
        textAlign: 'left',
        marginTop: 6,
        fontSize: 13,
        color: theme.palette.primary.light,
        marginLeft: 4
    }
});

export const MetadataViewFacets = (props: MetadataViewFacetsProperties) => {
    const {views, filters, facetsEx, clearFilterCandidates, filterCandidates, updateFilterCandidates, handleClearFilter, applyFilters, classes} = props;

    const getFilterValues = (type: ValueType, filter: MetadataViewFilter): any[] => {
        if (ofRangeValueType(type)) {
            return [filter.min, filter.max];
        }
        if (ofBooleanValueType(type)) {
            return filter.booleanValue === null ? [] : [filter.booleanValue];
        }
        return filter.values;
    };

    const renderSingleFacet = (facet: MetadataViewFacet) => {
        const facetOptions = getFilterValues(facet.type, facet);
        const activeFilter = [...filterCandidates, ...filters].find(filter => filter.field === facet.name);
        let activeFilterValues = [];
        if (activeFilter) {
            activeFilterValues = getFilterValues(facet.type, activeFilter);
        }
        return facetOptions && facetOptions.length > 0 && (
            <Grid key={facet.name} item>
                <Facet
                    type={facet.type}
                    title={facet.title}
                    options={facetOptions}
                    onChange={(values) => updateFilterCandidates(facet, values)}
                    extraClasses={classes.facet}
                    activeFilterValues={activeFilterValues}
                    clearFilter={() => handleClearFilter(facet.name)}
                />
            </Grid>
        );
    };

    const renderFacets = (view: MetadataViewOptions) => {
        const viewFacets = facetsEx.filter(facet => (facet.name.toLowerCase().startsWith(view.name.toLowerCase())));
        return viewFacets.length > 0 && (
            <Grid key={view.name} container item direction="column" justifyContent="flex-start" spacing={1}>
                <div className={classes.facetHeaders} style={{textTransform: 'uppercase'}}>{view.title}</div>
                {
                    viewFacets.map(facet => renderSingleFacet(facet, filters, filterCandidates, updateFilterCandidates, handleClearFilter))
                }
                {
                    // location is the collection location, which we will group under resources
                    (view.name.toLowerCase() === 'resource') ? (
                        facetsEx
                            .filter(facet => facet.name.toLowerCase().startsWith('location'))
                            .map(facet => (renderSingleFacet(facet, filters, filterCandidates, updateFilterCandidates, handleClearFilter)))
                    ) : ""
                }
            </Grid>
        );
    };

    const renderFacetConfirmButtons = () => (
        <Grid
            container
            spacing={1}
            className={`${classes.confirmFiltersButtonBlock} ${filterCandidates.length > 0 && classes.confirmFiltersButtonBlockActive}`}
        >
            <Grid item xs={4}>
                <Button
                    onClick={clearFilterCandidates}
                    variant="contained"
                    className={classes.confirmFiltersButton}
                    disabled={filterCandidates.length === 0}
                >
                    Cancel
                </Button>
            </Grid>
            <Grid item xs={8}>
                <Button
                    onClick={applyFilters}
                    variant="contained"
                    color="secondary"
                    className={classes.confirmFiltersButton}
                    disabled={filterCandidates.length === 0}
                >
                    Apply filters
                </Button>
            </Grid>
        </Grid>
    );

    return (
        <Grid container item direction="column" justifyContent="flex-start" spacing={1}>
            {views.map(view => renderFacets(view))}
            {renderFacetConfirmButtons()}
        </Grid>
    );
};

export default withStyles(styles)(MetadataViewFacets);
