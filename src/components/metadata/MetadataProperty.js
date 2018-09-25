import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
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
    // E.g. handleSave(1) will return a function `value => { ... }` that
    // can be used as a callback for the component for index 1
    const handleSave = index => newValue => {
        const currentEntry = property.values[index];

        if(currentEntry.value !== newValue) {
            const updatedValues = property.values.map((el, idx) => {
                if(idx === index) {
                    return {value: newValue}
                } else {
                    return el;
                }
            })

            return dispatch(updateMetadata(subject, property.key, updatedValues))
        } else {
            return Promise.resolve();
        }
    }

    const handleDelete = index => () => {
        const updatedValues = property.values.filter((el, idx) => idx !== index)
        return dispatch(updateMetadata(subject, property.key, updatedValues))
    }

    // Render the given entry as a list item
    const renderEntry = (entry, idx, PropertyValueComponent) => {
        return <ListItem key={idx}>
                <PropertyValueComponent property={property} entry={entry} onSave={handleSave(idx)}/>
                <IconButton aria-label="Delete" onClick={handleDelete(idx)}><DeleteIcon/></IconButton>
            </ListItem>
    }

    const valueComponent = ValueComponentFactory.build(property);

    return <ListItem key={property.key} style={{display: 'block'}}>
        <Typography variant="body2">{property.label}</Typography>
        <List dense>
            {property.values.map((entry, idx) => renderEntry(entry, idx, valueComponent))}
        </List>
    </ListItem>
}

export default connect()(MetadataProperty)
