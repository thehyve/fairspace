import React from 'react';
import {Chip, Grid, Typography} from '@material-ui/core';
import type {MetadataViewFacet, MetadataViewFilter} from "./MetadataViewAPI";
import {LOCATION_FILTER_FIELD, ofRangeValueType} from "./metadataViewUtils";
import {formatDateTime, isNonEmptyValue} from "../../common/utils/genericUtils";


type MetadataViewActiveFiltersProperties = {
    facets: MetadataViewFacet[];
    filters: MetadataViewFilter[];
};

export const MetadataViewActiveFilters = (props: MetadataViewActiveFiltersProperties) => {
    const {facets, filters} = props;

    const renderActiveFilterValues = (facet, filter) => {
        if (ofRangeValueType(facet.type)) {
            let min; let max; let label;
            if (facet.type === 'Date') {
                min = formatDateTime(filter.min);
                max = formatDateTime(filter.max);
            } else {
                min = filter.min;
                max = filter.max;
            }
            if (isNonEmptyValue(min) && isNonEmptyValue(max)) {
                label = `${min} - ${max}`;
            } else if (isNonEmptyValue(min)) {
                label = `from: ${min}`;
            } else if (isNonEmptyValue(max)) {
                label = `to: ${max}`;
            } else {
                return <></>;
            }
            return (
                <Chip
                    className={facet.backgroundColor}
                    key={`chip-${facet.name}`}
                    label={label}
                    style={{marginLeft: 5}}
                />
            );
        }
        return filter.values.map(valueIri => {
            const value = facet.values.find(val => val.value === valueIri);
            return (
                value && (
                    <Chip
                        className={facet.backgroundColor}
                        key={value.value}
                        label={value.label}
                        style={{marginLeft: 5}}
                    />
                )
            );
        });
    };

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
                filters && filters.map(filter => {
                    if ((!isNonEmptyValue(filter.min) && !isNonEmptyValue(filter.max) && (!filter.values || filter.values.length === 0))
                        || filter.field === LOCATION_FILTER_FIELD) {
                        return null;
                    }
                    const facet = facets.find(f => f.name === filter.field);
                    if (facet) {
                        return (
                            <Grid key={filter.field} item>
                                <Typography variant="overline" component="span">{facet.title}</Typography>
                                {renderActiveFilterValues(facet, filter)}
                            </Grid>
                        );
                    }
                    return <></>;
                })
            }
        </Grid>
    );
};

export default MetadataViewActiveFilters;
