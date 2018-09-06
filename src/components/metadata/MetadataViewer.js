import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from "@material-ui/core/Typography";


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
            <ListItem key={MetadataViewer.extractDisplayValue(v)}>
                {MetadataViewer.retrieveDisplayableItem(v)}
            </ListItem>)
    }

    static navigableLink(link) {
        return link.startsWith(window.location.origin)
            ? link.replace('/iri/collections/', '/collections/').replace('/iri/', '/metadata/')
            : link
    }

    static retrieveDisplayableItem(v) {
        let displayValue = MetadataViewer.extractDisplayValue(v);

        if ('@id' in v) {
            return (<a href={MetadataViewer.navigableLink(v['@id'])}>{displayValue}</a>)
        } else {
            return displayValue;
        }
    }


    static extractDisplayValue(v) {
        return v['rdfs:label'] || MetadataViewer.linkLabel(v['@id']) || v['@value'] || '';
    }

    static linkLabel(link) {
        return link && link.startsWith(window.location.origin) ? (
            link.toString().includes('#')
                ? link.substring(link.lastIndexOf('#') + 1)
                : link.substring(link.lastIndexOf('/') + 1)
        ) : link;
    }

    renderProperty(p) {
        const items = p.values.map(MetadataViewer.renderValue.bind(this));
        return (
            <ListItem key={p.label}>
                <div>
                    <Typography variant="subheading">{p.label}:</Typography>
                    <List dense={true}>{items}</List>
                </div>
            </ListItem>);
    }

    render() {
        return (<List>{this.properties.map(this.renderProperty.bind(this))}</List>)
    }
}

export default MetadataViewer
