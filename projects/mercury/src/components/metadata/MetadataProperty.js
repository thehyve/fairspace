import React from 'react';
import {connect} from 'react-redux';
import {
    List, ListItem, Typography, IconButton,
    ListItemSecondaryAction, ListItemText
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import {updateMetadata as updateMetadataAction} from "../../actions/metadataActions";
import ValueComponentFactory from "./values/ValueComponentFactory";
import ErrorDialog from "../common/ErrorDialog";
import * as constants from '../../constants';

class MetadataProperty extends React.Component {
    state = {
        hoveredIndex: null
    };

    // Function to save a certain value.
    // Calling it with an index provides you with a function that
    // will save a given value (if it has changed) along with the other
    // unchanged values.
    // E.g. handleSave(1) will return a function `value => { ... }` that
    // can be used as a callback for the component for index 1
    handleSave = index => (newEntry) => {
        const {subject, property, updateMetadata} = this.props;
        const currentEntry = property.values[index];

        if (currentEntry.value !== newEntry.value) {
            const updatedValues = property.values.map((el, idx) => ((idx === index) ? newEntry : el));
            return updateMetadata(subject, property.key, updatedValues)
                .catch(e => ErrorDialog.showError(e, "Error while saving metadata"));
        }
        return Promise.resolve();
    };

    handleAdd = (newEntry) => {
        const {subject, property, updateMetadata} = this.props;

        if (newEntry.value || newEntry.id) {
            const updatedValues = [...property.values, newEntry];

            return updateMetadata(subject, property.key, updatedValues)
                .catch(e => ErrorDialog.showError(e, "Error while adding metadata"));
        }
        return Promise.resolve();
    };

    handleDelete = index => () => {
        const {subject, property, updateMetadata} = this.props;
        const updatedValues = property.values.filter((el, idx) => idx !== index);

        return updateMetadata(subject, property.key, updatedValues)
            .catch(e => ErrorDialog.showError(e, "Error while deleting metadata"));
    };

    setHoveredIndex = (hoveredIndex) => {
        this.setState({hoveredIndex});
    };

    renderEntry = (entry, idx, PropertyValueComponent, labelledBy) => {
        const {editable, property} = this.props;
        const visibility = this.state.hoveredIndex === idx ? 'visible' : 'hidden';

        return (
            <div
                key={idx}
                onMouseEnter={() => this.setHoveredIndex(idx)}
                onMouseLeave={() => this.setHoveredIndex(null)}
            >
                <ListItem>
                    <ListItemText>
                        <PropertyValueComponent
                            property={property}
                            entry={entry}
                            onSave={this.handleSave(idx)}
                            aria-labelledby={labelledBy}
                        />
                    </ListItemText>
                    {
                        editable
                            ? (
                                <ListItemSecondaryAction>
                                    <IconButton
                                        size="small"
                                        aria-label="Delete"
                                        title="Delete"
                                        onClick={this.handleDelete(idx)}
                                        style={{visibility}}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            ) : null
                    }
                </ListItem>
            </div>
        );
    };

    renderAddComponent = (labelledBy) => {
        const {property} = this.props;
        const ValueAddComponent = ValueComponentFactory.addComponent(property);

        return (
            <ListItem key={property.values.length}>
                <ListItemText>
                    <ValueAddComponent
                        property={property}
                        placeholder="Add new"
                        onSave={this.handleAdd}
                        aria-labelledby={labelledBy}
                    />
                </ListItemText>
            </ListItem>
        );
    };

    render() {
        const {editable, property} = this.props;

        // Do not show an add component if no multiples are allowed
        // and there is already a value
        const editableAndNotMachineOnly = editable && !property.machineOnly;
        const canAdd = editableAndNotMachineOnly && (property.allowMultiple || property.values.length === 0);
        const labelId = `label-${property.key}`;

        // The edit component should not actually allow editing the value if editable is set to false
        // or if the property contains settings that disallow editing existing values
        const disableEditing = !editable || MetadataProperty.disallowEditingOfExistingValues(property);
        const ValueComponent = disableEditing
            ? ValueComponentFactory.readOnlyComponent()
            : ValueComponentFactory.editComponent(property);

        return (
            <ListItem disableGutters key={property.key} style={{display: 'block'}}>
                <Typography variant="body1" component="label" id={labelId}>
                    {property.label}
                </Typography>
                <List dense>
                    {property.values.map((entry, idx) => this.renderEntry(entry, idx, ValueComponent, labelId))}
                    {canAdd ? this.renderAddComponent(labelId) : null}
                </List>
            </ListItem>
        );
    }

    /**
     * Checks whether the configuration of this property disallowed editing of existing values
     * This is the case if
     *   - the property is machineOnly
     *   - the field refers to a url (marked as RESOURCE_URI)
     *   - the value is taken from a set of allowed values
     * @param property
     * @returns {Boolean}
     */
    static disallowEditingOfExistingValues(property) {
        return property.machineOnly
            || property.className === constants.RESOURCE_URI
            || property.allowedValues;
    }
}

const mapDispatchToProps = {
    updateMetadata: updateMetadataAction
};

export default connect(null, mapDispatchToProps)(MetadataProperty);
