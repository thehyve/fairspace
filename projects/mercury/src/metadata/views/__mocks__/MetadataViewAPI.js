import type {MetadataViewData, MetadataViewFacet, MetadataViewOptions} from "../MetadataViewAPI";
import {isFilesView} from "../metadataViewUtils";

export const mockViews: MetadataViewOptions[] = () => [
    {
        name: "Subject",
        title: "Subjects",
        columns: [
            {
                name: "Subject",
                title: "Subject",
                type: "Identifier"
            },
            {
                name: "Subject_gender",
                title: "Gender",
                type: "Term"
            },
            {
                name: "Subject_species",
                title: "Species",
                type: "Term"
            },
            {
                name: "Subject_birthDate",
                title: "Birth date",
                type: "Date"
            },
            {
                name: "Collection",
                title: "Files",
                type: "dataLink"
            }
        ]
    },
    {
        name: "Sample",
        title: "Samples",
        columns: [
            {
                name: "Sample",
                title: "Sample",
                type: "Identifier"
            },
            {
                name: "Sample_sampleType",
                title: "Sample type",
                type: "Term"
            },
            {
                name: "Sample_topography",
                title: "Topography",
                type: "Term"
            },
            {
                name: "Sample_tumorCellularity",
                title: "Tumor cellularity",
                type: "Number"
            },
            {
                name: "Sample_nature",
                title: "Nature",
                type: "Term"
            },
            {
                name: "Sample_origin",
                title: "Origin",
                type: "Term"
            },
            {
                name: "Collection",
                title: "Files",
                type: "dataLink"
            }
        ]
    },
    {
        name: "Collection",
        title: "Collections",
        columns: [
            {
                name: "Collection",
                title: "Collection",
                type: "Identifier"
            }, {
                name: "Collection_analysisType",
                title: "Analysis type",
                type: "Term"
            }, {
                name: "Collection_keyword",
                title: "Key words",
                type: "Set"
            }
        ]
    }
];

export const mockGetViews: Promise<MetadataViewOptions[]> = () => (
    new Promise(resolve => resolve(mockViews()))
);

export const mockFacets = (name) => {
    switch (name) {
        case "Sample":
            return [
                {
                    name: 'Sample_sampleType',
                    title: 'Sample type',
                    query: "",
                    type: "Term",
                    values: [
                        {
                            label: 'Blood',
                            value: 'http://example.com/sampleType#blood'
                        },
                        {
                            label: 'Tissue',
                            value: 'http://example.com/sampleType#tissue'
                        }
                    ]
                },
                {
                    name: 'Sample_topography',
                    title: 'Topography',
                    query: "",
                    type: "Term",
                    values: [
                        {
                            label: 'Lip',
                            value: 'http://example.com/topography#lip'
                        },
                        {
                            label: 'Gum',
                            value: 'http://example.com/topography#gum'
                        },
                        {
                            label: 'Tongue',
                            value: 'http://example.com/topography#tongue'
                        }
                    ]
                },
                {
                    name: 'Sample_tumorCellularity',
                    title: 'Tumor cellularity',
                    query: "",
                    type: "Number",
                    min: 2,
                    max: 8
                },
                {
                    name: 'Subject_nature',
                    title: 'Nature',
                    query: "",
                    type: "Term",
                    values: [
                        {
                            label: 'Protein',
                            value: 'http://example.com/sampleNature#protein'
                        },
                        {
                            label: 'RNA',
                            value: 'http://example.com/sampleNature#rna'
                        },
                        {
                            label: 'DNA',
                            value: 'http://example.com/sampleNature#dna'
                        },
                        {
                            label: 'Tumor Cell Line',
                            value: 'http://example.com/sampleNature#tcl'
                        },
                        {
                            label: 'Peripheral Blood Mononuclear Cell',
                            value: 'http://example.com/sampleNature#pbmc'
                        },
                        {
                            label: 'Frozen Specimen',
                            value: 'http://example.com/sampleNature#fs'
                        },
                        {
                            label: 'Paraffin Embedded Tissue (FFPE)',
                            value: 'http://example.com/sampleNature#ffpe'
                        },
                        {
                            label: 'Urine',
                            value: 'http://example.com/sampleNature#urine'
                        }
                    ]
                },
                {
                    name: 'Subject_origin',
                    title: 'Origin',
                    query: "",
                    type: "Term",
                    values: [
                        {
                            label: 'Normal',
                            value: 'http://example.com/sampleOrigin#normal'
                        },
                        {
                            label: 'Tumoral',
                            value: 'http://example.com/sampleOrigin#tumoral'
                        }
                    ]
                }
            ];
        case "Subject":
            return [
                {
                    name: 'Subject_gender',
                    title: 'Gender',
                    query: "",
                    type: "Term",
                    values: [
                        {
                            label: 'Male',
                            value: 'http://example.com/gender#male'
                        },
                        {
                            label: 'Female',
                            value: 'http://example.com/gender#female'
                        },
                        {
                            label: 'Undifferentiated',
                            value: 'http://example.com/gender#undifferentiated'
                        }
                    ]
                },
                {
                    name: 'Subject_species',
                    title: 'Species',
                    query: "",
                    type: "Term",
                    values: [
                        {
                            label: 'Homo sapiens',
                            value: 'http://example.com/species#hs'
                        },
                        {
                            label: 'Escherichia coli',
                            value: 'http://example.com/species#ec'
                        },
                        {
                            label: 'Bacillus subtilis',
                            value: 'http://example.com/species#bs'
                        }
                    ]
                },
                {
                    name: 'Subject_birthDate',
                    title: 'Birth date',
                    query: "",
                    type: "Date",
                    min: new Date(2010, 11, 25),
                    max: new Date(2020, 1, 4)
                }
            ];
        case "Collection":
            return [
                {
                    name: 'Subject_analysisType',
                    title: 'Analysis type',
                    query: "",
                    type: "Term",
                    values: [
                        {
                            label: 'Biology',
                            value: 'http://example.com/analysisType#biology'
                        },
                        {
                            label: 'Imaging',
                            value: 'http://example.com/analysisType#imaging'
                        },
                        {
                            label: 'Omic',
                            value: 'http://example.com/analysisType#omic'
                        },
                        {
                            label: 'Pathology',
                            value: 'http://example.com/analysisType#pathology'
                        }
                    ]
                }
            ];
        default:
            return [];
    }
};

export const mockGetFacets: Promise<MetadataViewFacet[]> = (name) => (
    new Promise(resolve => resolve(mockFacets(name)))
);

export const mockRows = (viewName) => {
    switch (viewName) {
        case "Sample":
            return [
                {
                    'Sample': 'http://example.com/sampleType/s01',
                    'Sample.label': 'S01',
                    'Sample_sampleType': 'http://example.com/sampleType#tissue',
                    'Sample_sampleType.label': 'Tissue',
                    'Sample_topography': 'http://example.com/sampleType#lip',
                    'Sample_topography.label': 'Lip',
                    'Sample_tumorCellularity': '2',
                    'Sample_nature': 'http://example.com/sampleType#dna',
                    'Sample_nature.label': 'DNA',
                    'Sample_origin': 'http://example.com/sampleType#normal',
                    'Sample_origin.label': 'Normal',
                    'Collection': [
                        {iri: 'http://localhost:8080/api/v1/webdav/f01', label: 'f01'},
                        {iri: 'http://localhost:8080/api/v1/webdav/f02', label: 'f02'}
                    ]
                },
                {
                    'Sample': 'http://example.com/sampleType/s02',
                    'Sample.label': 'S02',
                    'Sample_sampleType': 'http://example.com/sampleType#tissue',
                    'Sample_sampleType.label': 'Tissue',
                    'Sample_topography': 'http://example.com/sampleType#tongue',
                    'Sample_topography.label': 'Tongue',
                    'Sample_tumorCellularity': '4',
                    'Sample_nature': 'http://example.com/sampleType#dna',
                    'Sample_nature.label': 'DNA',
                    'Sample_origin': 'http://example.com/sampleType#tumoral',
                    'Sample_origin.label': 'Tumoral',
                },
            ];
        case "Subject":
            return [
                {
                    'Subject': 'http://example.com/sampleType/p01',
                    'Subject.label': 'P01',
                    'Subject_gender': 'http://example.com/sampleType#male',
                    'Subject_gender.label': 'Male',
                    'Subject_species': 'http://example.com/sampleType#hs',
                    'Subject_species.label': 'Homo Sapiens',
                    'Subject_birthDate': new Date(2010, 11, 25).toLocaleString(),
                    'Collection': [
                        {iri: 'http://localhost:8080/api/v1/webdav/f01', label: 'f01'},
                        {iri: 'http://localhost:8080/api/v1/webdav/f02', label: 'f02'}
                    ]
                },
                {
                    'Subject': 'http://example.com/sampleType/p02',
                    'Subject.label': 'P02',
                    'Subject_gender': 'http://example.com/sampleType#male',
                    'Subject_gender.label': 'Male',
                    'Subject_species': 'http://example.com/sampleType#hs',
                    'Subject_species.label': 'Homo Sapiens'
                },
                {
                    'Subject': 'http://example.com/sampleType/p03',
                    'Subject.label': 'P03',
                    'Subject_gender': 'http://example.com/sampleType#female',
                    'Subject_gender.label': 'Female',
                    'Subject_species': 'http://example.com/sampleType#hs',
                    'Subject_species.label': 'Homo Sapiens',
                    'files': [
                        {iri: 'http://localhost:8080/api/v1/webdav/f01', label: 'f01'}
                    ]
                },
                {
                    'Subject': 'http://example.com/sampleType/p04',
                    'Subject.label': 'P04',
                    'Subject_gender': 'http://example.com/sampleType#male',
                    'Subject_gender.label': 'Male',
                    'Subject_species': 'http://example.com/sampleType#hs',
                    'Subject_species.label': 'Homo Sapiens'
                },
                {
                    'Subject': 'http://example.com/sampleType/p05',
                    'Subject.label': 'P05',
                    'Subject_gender': 'http://example.com/sampleType#female',
                    'Subject_gender.label': 'Female',
                    'Subject_species': 'http://example.com/sampleType#hs',
                    'Subject_species.label': 'Homo Sapiens'
                },
                {
                    'Subject': 'http://example.com/sampleType/p06',
                    'Subject.label': 'P06',
                    'Subject_gender': 'http://example.com/sampleType#female',
                    'Subject_gender.label': 'Female',
                    'Subject_species': 'http://example.com/sampleType#hs',
                    'Subject_species.label': 'Homo Sapiens'
                },
            ];
        case "Collection":
            return [
                {
                    'Collection': 'http://localhost:8080/api/v1/webdav/c01',
                    'Collection.label': 'C01',
                    'Collection_analysisType': 'http://example.com/analysisType#biology',
                    'Collection_analysisType.label': 'Biology'
                }
            ];
        default:
            return [];
    }
};

export const mockGetViewData: Promise<MetadataViewData> = (viewName) => {
    const rows = mockRows(viewName);
    return new Promise(resolve => resolve({
        page: 0,
        rows,
        totalCount: !isFilesView(rows) && rows.length
    }));
};
