import React from 'react';
import MetadataViewer from "./MetadataViewer";
import Error from "../error/Error";

class Metadata extends React.Component {
    constructor(props) {
        super(props);
        this.subject = props.subject;
        this.metadataStore = props.metadataStore;

        this.state = {
            loading: false,
            error: false,
            errorMessage: null,
            vocabulary: {},
            metadata: {}
        };
    }

    componentWillMount() {
        this.loadData();
    }

    loadData() {
        if(!this.subject) {
            this.setState({error: true, errorMessage: "No subject given to retrieve metadata for"});
            console.warn(this.state.errorMessage);
            return;
        }

        this.setState({loading: true, error: false});

        Promise.all([
            this.metadataStore.getVocabulary(),
            this.metadataStore.get(this.subject)
        ]).then(([vocabulary, metadata]) => {
            if(this.willUnmount) return;

            this.setState({loading: false, vocabulary: vocabulary, metadata: metadata})
        }).catch(e => {
            if(this.willUnmount) return;
            this.setState({error: true, errorMessage: "Error while loading metadata"});
            console.error(this.state.errorMessage, e);
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
            return (<Error message={this.state.errorMessage}/>)
        } else if(this.state.loading) {
            return (<div>Loading...</div>)
        } else {
            return (<MetadataViewer vocabulary={this.state.vocabulary} metadata={this.state.metadata}/>)
        }
    }

}

export default Metadata
