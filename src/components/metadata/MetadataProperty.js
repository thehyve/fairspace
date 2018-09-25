import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from "@material-ui/core/Typography";
import {connect} from 'react-redux';
import {updateMetadata} from "../../actions/metadata";
import ValueComponentFactory from "./values/ValueComponentFactory";

/**
 * Shows the property and values for the property
 */
function MetadataProperty({subject, property, dispatch}) {
    // Function to save a certain value.
    // Calling it with an index provides you with a function that
    // will save a given value (if it has changed) along with the other
    // unchanged values.
    // E.g. saveValue(1) will return a function `value => { ... }` that
    // can be used as a callback for the component for index 1
    const saveValue = index => newValue => {
        const currentEntry = property.values.find(el => el.index === index);

        if(currentEntry.value !== newValue) {
            const updatedValues = property.values.map(el => {
                if(el.index === index) {
                    return {index: index, value: newValue}
                } else {
                    return el;
                }
            })

            return dispatch(updateMetadata(subject, property.key, updatedValues))
        } else {
            return Promise.resolve();
        }
    }

    // Render the given entry as a list item
    const renderEntry = (entry, PropertyValueComponent) => {
        return <ListItem key={entry.index}>
                <PropertyValueComponent property={property} entry={entry} onBlur={saveValue(entry.index)}/>
            </ListItem>
    }

    const valueComponent = ValueComponentFactory.build(property);

    return <ListItem key={property.key} style={{display: 'block'}}>
        <Typography variant="body2">{property.label}</Typography>
        <List dense>
            {property.values.map(entry => renderEntry(entry, valueComponent))}
        </List>
    </ListItem>
}

export default connect()(MetadataProperty)
