import React from 'react';
import combine from './MetadataUtils';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';


/**
 * This compp
 */
class MetadataViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.vocabulary = props.vocabulary;
        this.metadata = props.metadata;
        this.state = {
            properties: [],
            error: false,
            loading: false,
            errorMessage: ""
        };
    }

    componentWillMount() {
        this.setState({loading: true});
        combine(this.vocabulary, this.metadata)
            .catch(err => {
                this.setState({error: true, errorMessage: "Error occured while combining vocabulary and metadata."});
                console.error(this.state.errorMessage, err);
            })
            .then(props => {
                if (this.willUnmount) {
                    return
                } else if (props.length === 0) {
                    this.setState({
                        error: true, loading: false,
                        errorMessage: "No metadata found"
                    });
                    console.warn(this.state.errorMessage);
                    return
                }
                this.setState({properties: props, loading: false});
            });
    }

    componentWillUnmount() {
        this.willUnmount = true
    }

    static renderValue(v) {
        return (
            <ListItem>
                {this.retrieveDisplayableItem(v)}
            </ListItem>)
    }

    static navigableLink(link) {
        return link.startsWith(window.location.origin)
            ? link.replace('/iri/', '/metadata/')
            : link
    }

    retrieveDisplayableItem(v) {
        let displayValue = v['rdfs:label'] || v['@id'] || v['@value'] || '';

        if ('@id' in v) {
            return (<a href={MetadataViewer.navigableLink(v['@id'])}>{displayValue}</a>)
        } else {
            return displayValue;
        }
    }


    renderProperty(p) {
        const items = p.values.map(MetadataViewer.renderValue.bind(this));
        return (
            <ListItem>
                <div>
                    <b>{p.label}:</b>
                    <List dense={true}>{items}</List>
                </div>
            </ListItem>);
    }

    render() {
        if (this.state.error) {
            return (<div>{this.state.errorMessage}</div>)
        } else if (this.state.loading) {
            return ("Loading...")
        } else {
            return (<List>{this.state.properties.map(this.renderProperty.bind(this))}</List>)
        }
    }
}

export default MetadataViewer
