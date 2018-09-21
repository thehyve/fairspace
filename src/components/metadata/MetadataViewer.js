import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from "@material-ui/core/Typography";
import StringProperty from "./properties/StringProperty";
import ReferringProperty from "./properties/ReferringProperty";


/**
 * This component will always display correct metadata. If any error occurs it is handled by Metadata
 */
const MetadataViewer = props => {
    function renderProperty(property) {
        const items = property.values.map(entry => renderEntry(property, entry));

        return <ListItem key={property.key}>
            <Typography variant="subheading">{property.label}</Typography>
            <List dense={true}>{items}</List>
        </ListItem>
    }

    function renderEntry(property, entry) {
        const Component = getValueComponentForProperty(property);
        return <ListItem key={entry.id || entry.value}>
                <Component property={property} entry={entry} onChange={console.log}/>
            </ListItem>
    }

    function getValueComponentForProperty(property) {
        switch(property.range) {
            case 'http://www.w3.org/TR/xmlschema11-2/#string':
                return StringProperty;
            default:
                return ReferringProperty;
        }
    }

    return <List>
        {props.properties.map(renderProperty)}
        </List>
}

export default MetadataViewer
