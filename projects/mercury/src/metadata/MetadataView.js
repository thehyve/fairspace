import React, {useContext, useState} from 'react';
import {Chip, Grid, Paper, Typography} from '@material-ui/core';
import {Grain} from '@material-ui/icons';
import MetadataViewTable from './MetadataViewTable';
import MetadataViewFacet from './MetadataViewFacet';
import MetadataViewAPI from './MetadataViewAPI';
import BreadCrumbs from '../common/components/BreadCrumbs';
import {usePalette} from '../common/palette';
import useAsync from "../common/hooks/UseAsync";
import MetadataViewContext from "./MetadataViewContext";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";
import type {MetadataViewFilter} from "./MetadataViewAPI";


const getFacetValuesByName = (name) => {
    switch (name) {
        case "samples":
            return [
                {
                    label: 'Blood',
                    iri: 'http://example.com/sampleType#blood'
                },
                {
                    label: 'Tissue',
                    iri: 'http://example.com/sampleType#tissue'
                }
            ];
        case "patients":
            return [
                {
                    label: 'Patient A',
                    iri: 'http://example.com/patients#A'
                },
                {
                    label: 'Patient B',
                    iri: 'http://example.com/patients#B'
                }
            ];
        case "collection":
            return [
                {
                    label: 'Collection A',
                    iri: 'http://example.com/collection#A'
                },
                {
                    label: 'Collection B',
                    iri: 'http://example.com/collection#B'
                }
            ];
        default: return [];
    }
};

const mockFacetValues = (facets: MetadataViewFacet[], borderColors, backgroundColors) => facets.map(
    facet => ({
        ...facet,
        values: getFacetValuesByName(facet.name),
        borderColor: borderColors[1],
        backgroundColors: backgroundColors[1]
    })
);

type MetadataViewProperties = {
    view: string;
}

export const MetadataView = (props: MetadataViewProperties) => {
    const {view: currentView} = props;
    const {views} = useContext(MetadataViewContext);
    const currentViewOptions = views.find(v => v.name === currentView) || {};

    const palette = usePalette();
    const borderColors = [
        palette.orangeBorder,
        palette.purpleBorder,
        palette.blueBorder,
        palette.amberBorder,
        palette.greenBorder,
        palette.indigoBorder,
        palette.lightGreenBorder,
        palette.blueGreyBorder,
        palette.tealBorder,
        palette.pinkBorder,
        palette.lightBlueBorder,
    ];
    const backgroundColors = [
        palette.orange,
        palette.purple,
        palette.blue,
        palette.amber,
        palette.green,
        palette.indigo,
        palette.lightGreen,
        palette.blueGrey,
        palette.teal,
        palette.pink,
        palette.lightBlue,
    ];

    const {data: facets = [], error: facetsError, loading: facetsLoading} = useAsync(
        () => MetadataViewAPI.getFacets()
            .then(res => mockFacetValues(res, borderColors, backgroundColors))
    );

    const [filters: MetadataViewFilter[], setFilters] = useState([]);

    const setFilterValues = (facetName: string, values: any[]) => {
        if (filters.find(f => f.field === facetName)) {
            const updatedFilters = [...filters];
            updatedFilters.find(f => (f.field === facetName)).values = values;
            setFilters(updatedFilters);
        } else {
            const newFilter: MetadataViewFilter = {
                field: facetName,
                values
            };
            setFilters([...filters, newFilter]);
        }
    };

    const renderFacets = () => (
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
                        <MetadataViewFacet
                            multiple
                            title={facet.title}
                            options={facet.values}
                            onChange={(values) => setFilterValues(facet.name, values)}
                            extraClasses={facet.borderColor}
                        />
                    </Grid>
                ))
            }
        </Grid>
    );

    const renderActiveFilters = () => (
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
                    if (!filter.values || filter.values.length === 0) {
                        return null;
                    }
                    const facet = facets.find(f => f.name === filter.field);
                    return (
                        <Grid key={filter.field} item>
                            <Typography variant="overline" component="span">{facet.name}</Typography>
                            {
                                filter.values.map(valueIri => {
                                    const value = facet.values.find(val => val.iri === valueIri);
                                    return (
                                        value && (
                                            <Chip
                                                className={facet.backgroundColor}
                                                key={value.iri}
                                                label={value.label}
                                                style={{marginLeft: 5}}
                                            />
                                        )
                                    );
                                })
                            }
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
                    label: currentView,
                    href: `/views/${currentView}`,
                    icon: <Grain />
                }
            ]
        }}
        >
            <BreadCrumbs />
            <Grid
                container
                direction="column"
                spacing={1}
            >
                {renderFacets()}
                {renderActiveFilters()}
            </Grid>
            <Paper style={{marginTop: 10, overflowX: 'auto'}}>
                <MetadataViewTable columns={currentViewOptions.columns} view={currentView} filters={filters} />
            </Paper>
        </BreadcrumbsContext.Provider>
    );
};

export default MetadataView;
