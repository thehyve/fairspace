import React, {useState} from 'react';
import {Chip, Grid, Paper, Typography} from '@material-ui/core';
import MetadataViewTable from './MetadataViewTable';
import MetadataViewFacet from './MetadataViewFacet';
import BreadCrumbs from '../common/components/BreadCrumbs';
import {usePalette} from '../common/palette';
import {Grain} from '@material-ui/icons';

type MetadataViewProperties = {
    view: string;
}

export const MetadataView = (props: MetadataViewProperties) => {
    const {view} = props;
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

    const columns = [
        {
            field: 'iri',
            label: 'Id'
        },
        {
            field: 'label',
            label: 'Sample'
        },
        {
            field: 'sampleType',
            label: 'Type'
        },
        {
            field: 'patient',
            label: 'Patient'
        }
    ];
    const sampleTypes = [
        {
            label: 'Blood',
            iri: 'http://example.com/sampleType#blood'
        },
        {
            label: 'Tissue',
            iri: 'http://example.com/sampleType#tissue'
        }
    ];
    const patients = [
        {
            label: 'Patient A',
            iri: 'http://example.com/patients#A'
        },
        {
            label: 'Patient B',
            iri: 'http://example.com/patients#B'
        }
    ];
    const facets = [
        {
            name: 'Patients',
            fieldName: 'patient',
            values: patients,
            borderColor: borderColors[0],
            backgroundColor: backgroundColors[0]
        },
        {
            name: 'Types',
            fieldName: 'sampleType',
            values: sampleTypes,
            borderColor: borderColors[1],
            backgroundColor: backgroundColors[1]
        }
    ];
    const facetByFieldName = Object.fromEntries(facets.map(facet => [facet.fieldName, facet]));
    const [filters, setFilters] = useState(Object.fromEntries(facets.map(facet => [facet.fieldName, []])));
    const data = [
        {
            iri: 'http://example.com/samples#123',
            label: 'Sample 123',
            sampleType: {
                iri: 'http://example.com/sampleType#tissue',
                label: 'Tissue'
            },
            patient: {
                iri: 'http://example.com/patients#A',
                label: 'Patient B'
            }
        },
        {
            iri: 'http://example.com/samples#456',
            label: 'Sample 456',
            sampleType: {
                iri: 'http://example.com/sampleType#blood',
                label: 'Blood'
            },
            patient: {
                iri: 'http://example.com/patients#B',
                label: 'Patient B'
            }
        }
    ];

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
                    <Grid key={facet.fieldName} item>
                        <MetadataViewFacet
                            multiple
                            title={facet.name}
                            options={facet.values}
                            onChange={(values) => {
                                setFilters({...filters, [facet.fieldName]: values});
                            }}
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
                filters && Object.entries(filters).map(([fieldName, selectedValues]) => {
                    if (!selectedValues || selectedValues.length === 0) {
                        return null;
                    }
                    const facet = facetByFieldName[fieldName];
                    return (
                        <Grid key={fieldName} item>
                            <Typography variant="overline" component="span">{facet.name}</Typography>
                            {
                                selectedValues.map(valueIri => {
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
        <>
            <BreadCrumbs additionalSegments={[
                {
                    label: view,
                    href: `/views/${view}`,
                    icon: <Grain />
                }
            ]}
            />
            <Grid
                container
                direction="column"
                spacing={1}
            >
                {renderFacets()}
                {renderActiveFilters()}
            </Grid>
            <Paper style={{marginTop: 10, overflowX: 'auto'}}>
                <MetadataViewTable columns={columns} data={data} />
            </Paper>
        </>
    );
};

export default MetadataView;
