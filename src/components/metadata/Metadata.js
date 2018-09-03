import React from 'react';
import MetadataViewer from "./MetadataViewer";
import ErrorMessage from "../error/ErrorMessage";
import combine from "./MetadataUtils";

class Metadata extends React.Component {
    constructor(props) {
        super(props);
        this.subject = props.subject;
        this.metadataStore = props.metadataStore;

        this.state = {
            loading: false,
            error: false,
            errorMessage: null,
            properties: {}
        };
    }

    componentWillMount() {
        this.loadData();
    }

    loadData() {
        if (!this.subject) {
            console.warn("No subject given to retrieve metadata for");
            this.setState({error: true});
            return;
        }

        this.setState({loading: true, error: false});

        Promise.all([
            this.metadataStore.getVocabulary(),
            this.metadataStore.get(this.subject)
        ]).then(([vocabulary, metadata]) => {
            if (this.willUnmount) return;

            combine(vocabulary, metadata)
                .then(props => {
                    if (this.willUnmount) return;

                    this.setState({properties: props, loading: false});
                }).catch(err => {
                console.error("Error occured while combining vocabulary and metadata.", err);
            });
        }).catch(e => {
            if(this.willUnmount) return;
            console.error("Error while loading metadata", e);
            this.setState({error: true, loading: false});
        })
    }

    componentWillUnmount() {
        this.willUnmount = true
    }

    componentWillReceiveProps(props) {
        this.subject = props.subject;
        this.loadData();
    }

    render() {
        if(this.state.error) {
            return (<div><ErrorMessage message="An error occurred while loading metadata" /></div>)
        } else if(this.state.loading) {
            return (<div>Loading...</div>)
        } else if (this.state.properties.length === 0) {
            return (<div>No metadata found</div>)
        } else {
            return (<MetadataViewer properties={this.state.properties}/>)
        }
    }

}

export default Metadata
