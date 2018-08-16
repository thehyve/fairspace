import React from 'react';

/**
 * This compp
 */
class MetadataViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.idsMap = {};
        this.contentMap = {};
        this.state = {
            metadata: props.metadata
        }
    }

    doc = {
        "http://schema.org/name": "Manu Sporny",
        "http://schema.org/url": {"@id": "http://manu.sporny.org/"},
        "http://schema.org/image": {"@id": "http://manu.sporny.org/images/manu.png"}
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

    testData = {
      "fairspace:name" : "John's quotes",
      "fairspace:description" : "What",
        "test" : [{"fairspace:name123" : "testerdetest"}],
        "fairspace:Collection" : "this url"
    };

    getIds(testData) {
        for (let key in testData) {
            if (key.includes("fairspace:")) {
                this.idsMap[key] = testData[key];
                delete testData[key];
            }
            else if (typeof testData[key] === 'object' || typeof key === 'number') {
                this.getIds(testData[key]);
            }
        }
    }

    getLabels() {
        for (let label in this.idsMap) {
            let found = false;
            for (const labelObject of this.vocab["@graph"]) {
                if (labelObject["@id"] === label) {
                    this.contentMap[labelObject["rdfs:label"]] = this.idsMap[label];
                    found = true;
                }
            }
            // TODO what if label is not found?
            if (!found) {
                this.contentMap[label] = this.idsMap[label];
            }
        }
    }

    renderContentMap() {
        const renderedContent = Object.keys(this.contentMap).map((content) =>
            <li><b>{content}</b>: {this.contentMap[content]}</li>
        );
        return renderedContent;
    }

    componentWillMount() {
        this.getIds(this.testData);
        this.getLabels();
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
