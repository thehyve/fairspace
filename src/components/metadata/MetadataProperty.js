import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import {connect} from 'react-redux';
import {updateMetadata} from "../../actions/metadata";
import ValueComponentFactory from "./values/ValueComponentFactory";
import ListItemText from "@material-ui/core/ListItemText";
import ErrorDialog from "../error/ErrorDialog";

/**
 * Shows the property and values for the property
 */
function MetadataProperty({editable, subject, property, dispatch, classes}) {
    // Function to save a certain value.
    // Calling it with an index provides you with a function that
    // will save a given value (if it has changed) along with the other
    // unchanged values.
    // E.g. handleSave(1) will return a function `value => { ... }` that
    // can be used as a callback for the component for index 1
    const handleSave = index => newEntry => {
        const currentEntry = property.values[index];

        if (currentEntry.value !== newEntry.value) {
            const updatedValues = property.values.map((el, idx) => {
                if (idx === index) {
                    return newEntry
                } else {
                    return el;
                }
            })

            return dispatch(updateMetadata(subject, property.key, updatedValues))
                .catch(e => ErrorDialog.showError(e, "Error while saving metadata"));
        } else {
            return Promise.resolve();
        }
    }

    const handleAdd = (newEntry) => {
        if (newEntry.value || newEntry.id) {
            const updatedValues = [...property.values, newEntry];

            return dispatch(updateMetadata(subject, property.key, updatedValues))
                .catch(e => ErrorDialog.showError(e, "Error while adding metadata"));
        } else {
            return Promise.resolve();
        }
    }

    const handleDelete = index => () => {
        const updatedValues = property.values.filter((el, idx) => idx !== index)
        return dispatch(updateMetadata(subject, property.key, updatedValues))
            .catch(e => ErrorDialog.showError(e, "Error while deleting metadata"));
    }

    // Render the given entry as a list item
    const renderEntry = (entry, idx, PropertyValueComponent) => {
        return <ListItem key={idx}>
            <ListItemText>
                <PropertyValueComponent
                    property={property}
                    entry={entry}
                    onSave={handleSave(idx)}
                />
            </ListItemText>
            {
                editable ?
                    <ListItemSecondaryAction>
                        <IconButton
                            aria-label="Delete"
                            onClick={handleDelete(idx)}>
                            <DeleteIcon/>
                        </IconButton>
                    </ListItemSecondaryAction> : null
            }
        </ListItem>;
    }

    // Do not show an add component if no multiples are allowed
    // and there is already a value
    const canAdd = editable && (property.allowMultiple || property.values.length === 0)

    const renderAddComponent = () =>
        <ListItem key={property.values.length}>
            <ListItemText>
                <ValueAddComponent
                    property={property}
                    placeholder="Add new"
                    onSave={handleAdd}/>
            </ListItemText>
        </ListItem>

    const ValueAddComponent = ValueComponentFactory.addComponent(property);
    const ValueComponent = editable ?
        ValueComponentFactory.editComponent(property) : ValueComponentFactory.readOnlyComponent();

    return <ListItem disableGutters key={property.key} style={{display: 'block'}}>
        <Typography variant="body1" component='p'>{property.label}</Typography>
        <List dense>
            {property.values.map((entry, idx) => renderEntry(entry, idx, ValueComponent))}
            {canAdd ? renderAddComponent() : null}
        </List>
    </ListItem>
}

export default connect()(MetadataProperty)
