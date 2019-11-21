import React from 'react';
import {BreadCrumbs, usePageTitleUpdater} from "@fairspace/shared-frontend";

import WithRightDrawer from "../common/components/WithRightDrawer";
import RecentActivity from "./RecentActivity";
import Config from "../common/services/Config";
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';

// TODO: for demo purposes
const properties = [
    {
        key: "http://fairspace.io/ontology#workspaceExternalLink",
        label: "External links that will be availble from the homepage.",
        path: "http://fairspace.io/ontology#workspaceExternalLink",
        shape: {
            "@type": [
                "http://fairspace.io/ontology#ExternalIRIPropertyShape"
            ],
            "@id": "_:b26",
            "http://fairspace.io/ontology#domainIncludes": [
                {
                    "@id": "http://fairspace.io/ontology#WorkspaceInstance"
                }
            ],
            "http://fairspace.io/ontology#externalLink": [
                {
                    "@value": true
                }
            ],
            "http://www.w3.org/ns/shacl#order": [
                {
                    "@value": 3
                }
            ],
            "http://www.w3.org/ns/shacl#name": [
                {
                    "@value": "External links that will be availble from the homepage."
                }
            ],
            "http://www.w3.org/ns/shacl#nodeKind": [
                {
                    "@id": "http://www.w3.org/ns/shacl#IRI"
                }
            ],
            "http://www.w3.org/ns/shacl#path": [
                {
                    "@id": "http://fairspace.io/ontology#workspaceExternalLink"
                }
            ]
        },
        multiLine: false,
        order: 3,
        machineOnly: false,
        isRdfList: false,
        isGenericIriResource: true,
        isExternalLink: true,
        allowAdditionOfEntities: false,
        isRelationShape: false,
        importantPropertyShapes: [],
        isEditable: false
    },
    {
        key: "http://fairspace.io/ontology#workspaceDescription",
        label: "A markdown formatted description for the workspace homepage.",
        path: "http://fairspace.io/ontology#workspaceDescription",
        shape: {
            "@type": [
                "http://fairspace.io/ontology#DatatypePropertyShape"
            ],
            "@id": "_:b27",
            "http://www.w3.org/ns/shacl#datatype": [
                {
                    "@id": "http://fairspace.io/ontology#markdown"
                }
            ],
            "http://fairspace.io/ontology#domainIncludes": [
                {
                    "@id": "http://fairspace.io/ontology#WorkspaceInstance"
                }
            ],
            "http://www.w3.org/ns/shacl#maxCount": [
                {
                    "@value": 1
                }
            ],
            "http://www.w3.org/ns/shacl#minCount": [
                {
                    "@value": 1
                }
            ],
            "http://www.w3.org/ns/shacl#order": [
                {
                    "@value": 2
                }
            ],
            "http://www.w3.org/ns/shacl#name": [
                {
                    "@value": "A markdown formatted description for the workspace homepage."
                }
            ],
            "http://www.w3.org/ns/shacl#path": [
                {
                    "@id": "http://fairspace.io/ontology#workspaceDescription"
                }
            ]
        },
        datatype: "http://fairspace.io/ontology#markdown",
        multiLine: true,
        order: 2,
        minValuesCount: 1,
        maxValuesCount: 1,
        machineOnly: false,
        isRdfList: false,
        isGenericIriResource: false,
        isExternalLink: false,
        allowAdditionOfEntities: false,
        isRelationShape: false,
        importantPropertyShapes: [],
        isEditable: false
    },
    {
        key: "http://fairspace.io/ontology#workspaceTitle",
        label: "A human title for this workspace.",
        path: "http://fairspace.io/ontology#workspaceTitle",
        shape: {
            "@type": [
                "http://fairspace.io/ontology#DatatypePropertyShape"
            ],
            "@id": "_:b29",
            "http://www.w3.org/ns/shacl#datatype": [
                {
                    "@id": "http://www.w3.org/2001/XMLSchema#string"
                }
            ],
            "http://fairspace.io/ontology#domainIncludes": [
                {
                    "@id": "http://fairspace.io/ontology#WorkspaceInstance"
                }
            ],
            "http://www.w3.org/ns/shacl#maxCount": [
                {
                    "@value": 1
                }
            ],
            "http://www.w3.org/ns/shacl#minCount": [
                {
                    "@value": 1
                }
            ],
            "http://www.w3.org/ns/shacl#order": [
                {
                    "@value": 1
                }
            ],
            "http://www.w3.org/ns/shacl#name": [
                {
                    "@value": "A human title for this workspace."
                }
            ],
            "http://www.w3.org/ns/shacl#path": [
                {
                    "@id": "http://fairspace.io/ontology#workspaceTitle"
                }
            ]
        },
        datatype: "http://www.w3.org/2001/XMLSchema#string",
        multiLine: true,
        order: 1,
        minValuesCount: 1,
        maxValuesCount: 1,
        machineOnly: false,
        isRdfList: false,
        isGenericIriResource: false,
        isExternalLink: false,
        allowAdditionOfEntities: false,
        isRelationShape: false,
        importantPropertyShapes: [],
        isEditable: false
    },
    {
        key: "@type",
        label: "Type",
        maxValuesCount: 1,
        machineOnly: true,
        isEditable: false
    }
];
const values = {
    "@type": [
        {
            id: "http://fairspace.io/ontology#WorkspaceInstance"
        }
    ],
    "http://fairspace.io/ontology#createdBy": [
        {
            id: "http://localhost/iri/6e6cde34-45bc-42d8-8cdb-b6e9faf890d3",
            otherEntry: {
                "@id": "http://localhost/iri/6e6cde34-45bc-42d8-8cdb-b6e9faf890d3",
                "label": [
                    "John Snow"
                ]
            }
        }
    ],
    "http://fairspace.io/ontology#dateCreated": [
        {
            value: "2019-11-21T11:39:22.372Z",
            otherEntry: {}
        }
    ],
    "http://fairspace.io/ontology#workspaceDescription": [
        {
            value: "# Demo Workspace\nThis description is a demo for the given workspace",
            otherEntry: {}
        }
    ],
    "http://fairspace.io/ontology#workspaceExternalLink": [
        {
            id: "http://example.com",
            otherEntry: {}
        }
    ],
    "http://fairspace.io/ontology#workspaceTitle": [
        {
            value: "Demo Workspace",
            otherEntry: {}
        }
    ]
};
export default () => {
    usePageTitleUpdater("Home");

    return (
        <>
            {
                Config.get().enableExperimentalFeatures
                    ? (
                        <WithRightDrawer
                            collapsible={false}
                            mainContents={<BreadCrumbs />}
                            drawerContents={<RecentActivity />}
                        />
                    )
                    : <BreadCrumbs />
            }
            <LinkedDataMetadataProvider>
                <LinkedDataEntityForm properties={properties} values={values} />
            </LinkedDataMetadataProvider>
        </>
    );
};
