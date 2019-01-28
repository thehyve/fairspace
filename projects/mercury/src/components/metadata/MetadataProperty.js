import React from 'react';
import {connect} from 'react-redux';
import {compose} from "redux";
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
        hovered: false
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

    setHover = (hovered) => {
        this.setState({hovered});
    }

    renderEntry = (entry, idx, PropertyValueComponent, labelledBy) => {
        const {editable, property} = this.props;
        const visibility = this.state.hovered ? 'visible' : 'hidden';

        return (
            <div
                key={idx}
                onMouseEnter={() => this.setHover(true)}
                onMouseLeave={() => this.setHover(false)}
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
                                <ListItemSecondaryAction
                                    style={{visibility}}
                                >
                                    <IconButton
                                        size="small"
                                        aria-label="Delete"
                                        title="Delete"
                                        onClick={this.handleDelete(idx)}
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
        const isCollection = property.domain === constants.COLLECTION_URI;
        const isFile = property.domain === constants.FILE_URI;
        const isDirectory = property.domain === constants.DIRECTORY_URI;
        const isManaged = isCollection || isFile || isDirectory;
        if ((property.key === '@type')
            || (isManaged && property.key === constants.LABEL_URI)
            || (isCollection && property.key === constants.COMMENT_URI)) {
            return '';
        }
        // Do not show an add component if no multiples are allowed
        // and there is already a value
        const editableAndNotMachineOnly = editable && !property.machineOnly;
        const canAdd = editableAndNotMachineOnly && (property.allowMultiple || property.values.length === 0);
        const labelId = `label-${property.key}`;

        const ValueComponent = (editableAndNotMachineOnly && property.range !== constants.RESOURCE_URI)
            ? ValueComponentFactory.editComponent(property)
            : ValueComponentFactory.readOnlyComponent();

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
}

const mapDispatchToProps = {
    updateMetadata: updateMetadataAction
};

export default compose(connect(null, mapDispatchToProps))(MetadataProperty);
