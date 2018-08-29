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
                {this.setItem(v)}
            </ListItem>)
    }

    static navigableLink(link) {
        return link.startsWith(window.location.origin)
            ? link.replace('/iri/', '/metadata/')
            : link
    }

    setItem(v) {
        if ('@type' in v && 'rdfs:label' in v) {
            if (v['rdfs:label']){
                return (<a href={MetadataViewer.navigableLink(v['@type'])}>{v['rdfs:label']}</a>)
            } else {
                return (<a href={MetadataViewer.navigableLink(v['@type'])}>{v['@type']}</a>)
            }
        } else if ('@id' in v) {
            return (<a href={MetadataViewer.navigableLink(v['@id'])}>{v['@id']}</a>)
        } else {
            return v['@value']
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
        if (Object.keys(this.metadata).length === 0) {
            return ("No metadata found")
        } else {
            return (<List>{this.state.properties.map(this.renderProperty.bind(this))}</List>)
        }
    }
}

export default MetadataViewer
