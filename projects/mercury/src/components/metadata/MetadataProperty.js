import React from 'react';
import {
    List, ListItem, Typography, IconButton,
    ListItemSecondaryAction, ListItemText
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import ValueComponentFactory from "./values/ValueComponentFactory";
import * as constants from '../../constants';

class MetadataProperty extends React.Component {
    state = {
        hoveredIndex: null
    };

    setHoveredIndex = (hoveredIndex) => {
        this.setState({hoveredIndex});
    }

    renderEntry = (entry, idx, PropertyValueComponent, labelledBy) => {
        const {editable, property, onChange, onDelete} = this.props;
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
                            onChange={(value) => onChange(value, idx)}
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
                                        onClick={() => onDelete(idx)}
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
        const {property, onChange} = this.props;
        const ValueAddComponent = ValueComponentFactory.addComponent(property);

        return (
            <ListItem key={property.values.length}>
                <ListItemText>
                    <ValueAddComponent
                        property={property}
                        placeholder="Add new"
                        onChange={(value) => onChange(value)}
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

        const ValueComponent = (editableAndNotMachineOnly && property.className !== constants.RESOURCE_URI)
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

export default MetadataProperty;
