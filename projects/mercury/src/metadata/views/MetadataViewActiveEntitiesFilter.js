import React from 'react';
import {Chip, Grid, Typography} from '@mui/material';
import type {MetadataViewFacet, MetadataViewEntityFilter} from "./MetadataViewAPI";

type MetadataViewActiveFacetFiltersProperties = {
    facet: MetadataViewFacet;
    filter: MetadataViewEntityFilter;
    setFilters: () => {};
};

export const MetadataViewActiveEntitiesFilter = (props: MetadataViewActiveFacetFiltersProperties) => {
    const {facet, filter, setFilter} = props;

    const renderActiveFilterValues = () => filter.values.map(valueIri => {
        const value = facet.values.find(val => val.value === valueIri);
        return (
            value && (
                <Chip
                    className={facet.backgroundColor}
                    key={value.value}
                    label={value.label}
                    style={{marginLeft: 5}}
                    onDelete={() => {
                        filter.values = [...filter.values.filter(v => v !== value.value)];
                        setFilter(filter);
                    }}
                />
            )
        );
    });

    return (
        <Grid
            container
            item
            direction="row"
            justifyContent="flex-start"
            alignItems="stretch"
            spacing={1}
        >
            {
                filter && filter.values.length > 0 && facet
                && (

                    <Grid key={filter.field} item>
                        <Typography variant="overline" component="span">{facet.title}</Typography>
                        {renderActiveFilterValues(facet, filter)}
                    </Grid>
                )
            }
        </Grid>
    );
};

export default MetadataViewActiveEntitiesFilter;
