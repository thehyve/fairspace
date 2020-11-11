import type {MetadataViewData, MetadataViewFacet, MetadataViewOptions, ValueType} from "../MetadataViewAPI";

export const mockGetViews: Promise<MetadataViewOptions[]> = () => (
    new Promise(resolve => resolve([
        {
            name: "subjects",
            title: "Subjects",
            columns: [
                {
                    name: "label",
                    title: "Subject label"
                },
                {
                    name: "gender",
                    title: "Gender"
                },
                {
                    name: "species",
                    title: "Species"
                },
                {
                    name: "birthDate",
                    title: "Birth date"
                },
                {
                    name: "files",
                    title: "Files"
                }
            ]
        },
        {
            name: "samples",
            title: "Samples",
            columns: [
                {
                    name: "label",
                    title: "Sample label"
                },
                {
                    name: "sampleType",
                    title: "Sample type"
                },
                {
                    name: "topography",
                    title: "Topography"
                },
                {
                    name: "sampleNature",
                    title: "Nature"
                },
                {
                    name: "sampleOrigin",
                    title: "Origin"
                },
                {
                    name: "files",
                    title: "Files"
                }
            ]
        },
        {
            name: "collections",
            title: "Collections",
            columns: [
                {
                    name: "label",
                    title: "Collection label"
                }, {
                    name: "analysisType",
                    title: "Analysis type"
                }
            ]
        }
    ]))
);


export const mockGetFacets: Promise<MetadataViewFacet[]> = (name) => (
    new Promise(resolve => {
        switch (name) {
            case "samples":
                resolve([
                    {
                        name: 'sampleType',
                        title: 'Sample type',
                        query: "",
                        type: "text",
                        values: [
                            {
                                label: 'Blood',
                                iri: 'http://example.com/sampleType#blood'
                            },
                            {
                                label: 'Tissue',
                                iri: 'http://example.com/sampleType#tissue'
                            }
                        ]
                    },
                    {
                        name: 'topography',
                        title: 'Topography',
                        query: "",
                        type: "text",
                        values: [
                            {
                                label: 'Lip',
                                iri: 'http://example.com/topography#lip'
                            },
                            {
                                label: 'Gum',
                                iri: 'http://example.com/topography#gum'
                            },
                            {
                                label: 'Tongue',
                                iri: 'http://example.com/topography#tongue'
                            }
                        ]
                    },
                    {
                        name: 'tumorCellularity',
                        title: 'Tumor cellularity',
                        query: "",
                        type: "number",
                        rangeStart: 2,
                        rangeEnd: 8
                    },
                    {
                        name: 'sampleNature',
                        title: 'Nature',
                        query: "",
                        type: "text",
                        values: [
                            {
                                label: 'Protein',
                                iri: 'http://example.com/sampleNature#protein'
                            },
                            {
                                label: 'RNA',
                                iri: 'http://example.com/sampleNature#rna'
                            },
                            {
                                label: 'DNA',
                                iri: 'http://example.com/sampleNature#dna'
                            },
                            {
                                label: 'Tumor Cell Line',
                                iri: 'http://example.com/sampleNature#tcl'
                            },
                            {
                                label: 'Peripheral Blood Mononuclear Cell',
                                iri: 'http://example.com/sampleNature#pbmc'
                            },
                            {
                                label: 'Frozen Specimen',
                                iri: 'http://example.com/sampleNature#fs'
                            },
                            {
                                label: 'Paraffin Embedded Tissue (FFPE)',
                                iri: 'http://example.com/sampleNature#ffpe'
                            },
                            {
                                label: 'Urine',
                                iri: 'http://example.com/sampleNature#urine'
                            }
                        ]
                    },
                    {
                        name: 'sampleOrigin',
                        title: 'Origin',
                        query: "",
                        type: "text",
                        values: [
                            {
                                label: 'Normal',
                                iri: 'http://example.com/sampleOrigin#normal'
                            },
                            {
                                label: 'Tumoral',
                                iri: 'http://example.com/sampleOrigin#tumoral'
                            }
                        ]
                    }
                ]);
                break;
            case "subjects":
                resolve([
                    {
                        name: 'gender',
                        title: 'Gender',
                        query: "",
                        type: "text",
                        values: [
                            {
                                label: 'Male',
                                iri: 'http://example.com/gender#male'
                            },
                            {
                                label: 'Female',
                                iri: 'http://example.com/gender#female'
                            },
                            {
                                label: 'Undifferentiated',
                                iri: 'http://example.com/gender#undifferentiated'
                            }
                        ]
                    },
                    {
                        name: 'species',
                        title: 'Species',
                        query: "",
                        type: "text",
                        values: [
                            {
                                label: 'Homo sapiens',
                                iri: 'http://example.com/species#hs'
                            },
                            {
                                label: 'Escherichia coli',
                                iri: 'http://example.com/species#ec'
                            },
                            {
                                label: 'Bacillus subtilis',
                                iri: 'http://example.com/species#bs'
                            }
                        ]
                    },
                    {
                        name: 'birthDate',
                        title: 'Birth date',
                        query: "",
                        type: "date",
                        rangeStart: new Date(2010, 11, 25, 18, 33),
                        rangeEnd: new Date(2020, 1, 4, 18, 33)
                    }
                ]);
                break;
            case "collections":
                resolve([
                    {
                        name: 'analysisType',
                        title: 'Analysis type',
                        query: "",
                        type: "text",
                        values: [
                            {
                                label: 'Biology',
                                iri: 'http://example.com/analysisType#biology'
                            },
                            {
                                label: 'Imaging',
                                iri: 'http://example.com/analysisType#imaging'
                            },
                            {
                                label: 'Omic',
                                iri: 'http://example.com/analysisType#omic'
                            },
                            {
                                label: 'Pathology',
                                iri: 'http://example.com/analysisType#pathology'
                            }
                        ]
                    }
                ]);
                break;
            default:
                resolve([]);
        }
    })
);

const mockRows = (viewName) => {
    switch (viewName) {
        case "samples":
            return [
                {
                    'label': 'S01',
                    'sampleType': 'http://example.com/sampleType#tissue',
                    'sampleType.label': 'Tissue',
                    'topography': 'http://example.com/sampleType#lip',
                    'topography.label': 'Lip',
                    'sampleNature': 'http://example.com/sampleType#dna',
                    'sampleNature.label': 'DNA',
                    'sampleOrigin': 'http://example.com/sampleType#normal',
                    'sampleOrigin.label': 'Normal',
                    'files': ['http://localhost:8080/api/v1/webdav/c01', 'http://localhost:8080/api/v1/webdav/c01']
                },
                {
                    'label': 'S02',
                    'sampleType': 'http://example.com/sampleType#tissue',
                    'sampleType.label': 'Tissue',
                    'topography': 'http://example.com/sampleType#tongue',
                    'topography.label': 'Tongue',
                    'sampleNature': 'http://example.com/sampleType#dna',
                    'sampleNature.label': 'DNA',
                    'sampleOrigin': 'http://example.com/sampleType#tumoral',
                    'sampleOrigin.label': 'Tumoral',
                },
            ];
        case "subjects":
            return [
                {
                    'label': 'P01',
                    'gender': 'http://example.com/sampleType#male',
                    'gender.label': 'Male',
                    'species': 'http://example.com/sampleType#hs',
                    'species.label': 'Homo Sapiens',
                    'birthDate': new Date(2010, 11, 25, 18, 33).toLocaleString(),
                    'files': ['http://localhost:8080/api/v1/webdav/c01', 'http://localhost:8080/api/v1/webdav/c01']
                },
                {
                    'label': 'P02',
                    'gender': 'http://example.com/sampleType#male',
                    'gender.label': 'Male',
                    'species': 'http://example.com/sampleType#hs',
                    'species.label': 'Homo Sapiens'
                },
                {
                    'label': 'P03',
                    'gender': 'http://example.com/sampleType#female',
                    'gender.label': 'Female',
                    'species': 'http://example.com/sampleType#hs',
                    'species.label': 'Homo Sapiens',
                    'files': ['http://localhost:8080/api/v1/webdav/c01']
                },
                {
                    'label': 'P04',
                    'gender': 'http://example.com/sampleType#male',
                    'gender.label': 'Male',
                    'species': 'http://example.com/sampleType#hs',
                    'species.label': 'Homo Sapiens'
                },
                {
                    'label': 'P05',
                    'gender': 'http://example.com/sampleType#female',
                    'gender.label': 'Female',
                    'species': 'http://example.com/sampleType#hs',
                    'species.label': 'Homo Sapiens'
                },
            ];
        case "collections":
            return [
                {
                    'label': 'http://localhost:8080/api/v1/webdav/c01',
                    'label.label': 'C01',
                    'analysisType': 'http://example.com/analysisType#biology',
                    'analysisType.label': 'Biology'
                }
            ];
        default:
            return [];
    }
};

export const mockGetViewData: Promise<MetadataViewData> = (viewName) => (
    new Promise(resolve => resolve({
        page: 0,
        rows: mockRows(viewName)
    }))
);
