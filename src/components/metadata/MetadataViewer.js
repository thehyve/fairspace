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
            properties: []
        };
    }

    componentWillMount() {
        combine(this.vocabulary, this.metadata)
            .then(props => {
                if (this.willUnmount) {
                    return
                }
                this.setState({properties: props});
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
        let displayValue;

        if(v['rdfs:label']) {
            displayValue = v['rdfs:label'];
        } else if(v['@id']) {
            displayValue = v['@id'];
        } else if(v['@value']) {
            displayValue = v['@value'];
        } else {
            displayValue = '';
        }

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
        if (Object.keys(this.metadata).length) {
            return (<List>{this.state.properties.map(this.renderProperty.bind(this))}</List>)
        } else {
            return ("No metadata found")
        }
    }
}

export default MetadataViewer
