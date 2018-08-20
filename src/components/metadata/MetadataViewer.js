import React from 'react';
import combine from './MetadataUtils';


/**
 * This compp
 */
class MetadataViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        // this.vocab = props.vocab;
        this.metadata = this.testData;
        this.state = {
            metadata: null,
            vocab: null,
            properties: []
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




    componentWillMount() {
        combine(this.vocab, this.metadata)
            .then(props => { this.setState({properties: props})});

    }

    renderContentMap() {
        console.log(this.state.contentMap);
        return this.state.properties.map(p =>
            <li key={p.label}><b>{p.label}</b>: {p.values.join(', ')}</li>
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
