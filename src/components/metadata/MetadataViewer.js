import React from 'react';
import * as jsonld from 'jsonld/dist/jsonld';


/**
 * This compp
 */
class MetadataViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.contentMap = {};
        // this.vocab = null;
        this.metadata = this.testData;
        this.state = {
            metadata: null,
            vocab: null,
            contentMap: null
        };
    }

    testData = {
        "@id": "http://fairspace.com/iri/collections/1",
        "@type": "http://fairspace.io/ontology#Collection",
        "description": "My first collection",
        "name": "Collection 5",
        "@context": {
            "name": {
                "@id": "http://fairspace.io/ontology#name"
            },
            "description": {
                "@id": "http://fairspace.io/ontology#description"
            }
        }
    };

    vocab = {
        "@context": {
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "dc": "http://purl.org/dc/elements/1.1/",
            "schema": "http://schema.org/",
            "fairspace": "http://fairspace.io/ontology#"
        },
        "@graph": [
            {
                "@id": "fairspace:name",
                "@type": "rdf:Property",
                "rdfs:label": "Name"
            },
            {
                "@id": "fairspace:description",
                "@type": "rdf:Property",
                "rdfs:label": "Description"
            },
            {
                "@id": "fairspace:Collection",
                "@type": "rdf:Class",
                "rdfs:label": "Collection"
            }
        ]
    };

    updateMetadataState = (value) => {
        this.setState({metadata: value});
    };

    updateVocabState = (value) => {
        this.setState({vocab: value});
    };

    createVocabMapping = () => {
        const labelsById = {};
        this.state.vocab.forEach(propertyDefinition => {
            let id = propertyDefinition["@id"];
            let label = propertyDefinition['http://www.w3.org/2000/01/rdf-schema#label'][0];
            labelsById[id] = label["@value"];
        });
        return labelsById;
    };

    addToContentMap = (label, value) => {
        console.log(this.state.metadata);
        console.log(this.state.vocab);
        let itemList;
        if (label in this.contentMap) {
            if (typeof this.contentMap[label] === "object") {
                itemList = this.contentMap[label];
            }
            else {
                itemList = [this.contentMap[label]];
            }
            itemList.push(value);
            this.contentMap[label] = itemList;
        }
        else {
            this.contentMap[label] = value;
        }
        // if (itemList.length === 0 ) {
        //     this.setState({})
        // }
        // else {
        //     this.setState({})
        // }
    };

    createMetadataWithLabels = (labelsById) => {
        Object.keys(this.state.metadata).forEach((key) => {
            if (key in labelsById) {
                this.state.metadata[key].forEach((valObj) => {
                    this.addToContentMap(labelsById[key], valObj["@value"]);
                });
            }
        });

    };

    componentWillMount() {
        jsonld.expand(this.vocab)
            .then(this.updateVocabState);

        jsonld.expand(this.metadata)
            .then(metadataItems => this.updateMetadataState(metadataItems[0]))
            .then(this.createVocabMapping)
            .then(this.createMetadataWithLabels);
    }

    renderContentMap() {
        console.log(this.contentMap);
        return Object.keys(this.contentMap).map((contentLabel) =>
            <li><b>{contentLabel}</b>: {this.contentMap[contentLabel]}</li>
        );
    }

    render() {
        return (
            <div>
                <ul>
                    {this.renderContentMap()}
                </ul>

            </div>
        )

    }

}

export default MetadataViewer
