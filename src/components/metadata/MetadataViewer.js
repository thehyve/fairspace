import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';


/**
 * This component will always display correct metadata. If any error occurs it is handled by Metadata
 */
class MetadataViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.properties = props.properties;
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
        return (<List>{this.properties.map(this.renderProperty.bind(this))}</List>)

    }
}

export default MetadataViewer
