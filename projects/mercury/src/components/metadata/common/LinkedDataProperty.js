import React from 'react';
import {
    List, ListItem, Typography, IconButton,
    ListItemSecondaryAction, ListItemText
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import ValueComponentFactory from "../values/ValueComponentFactory";
import * as constants from '../../../constants';
import Vocabulary from '../../../services/Vocabulary';

class LinkedDataProperty extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredIndex: null,
            errors: []
        };
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.property.values !== this.props.property.values;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.property.values !== this.props.property.values) {
            this.updateErrors();
        }
    }

    setHoveredIndex = (hoveredIndex) => {
        this.setState({hoveredIndex});
    };

    // This is hard to do, because the values within the property are before the change
    // handleChnage = (value, index) => {
    //     const errors = Vocabulary.validatePropertyValues(this.props.property);
    //     this.props.onChange(value, index, errors && errors.length > 0);
    // }

    renderEntry = (entry, idx, PropertyValueComponent, labelledBy) => {
        const {editable, property, onChange, onDelete, subject} = this.props;
        const visibility = this.state.hoveredIndex === idx ? 'visible' : 'hidden';

        return (
            <div
                key={subject + property.key + entry.id || entry.value}
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
        const {property, onAdd} = this.props;
        const ValueAddComponent = ValueComponentFactory.addComponent(property);

        return (
            <ListItem key="add-component-key">
                <ListItemText>
                    <ValueAddComponent
                        property={property}
                        placeholder="Add new"
                        onChange={onAdd}
                        aria-labelledby={labelledBy}
                    />
                </ListItemText>
            </ListItem>
        );
    };

    updateErrors = () => {
        const {property, onValidityUpdate} = this.props;
        const errors = Vocabulary.validatePropertyValues(property);
        onValidityUpdate({isValid: !errors || errors.length === 0});
        this.setState({errors});
    }

    render() {
        const {editable, property} = this.props;
        const {errors} = this.state;

        if (errors.length > 0) {
            console.log({errors});
        }

        // Do not show an add component if no multiples are allowed
        // and there is already a value
        const editableAndNotMachineOnly = editable && !property.machineOnly;
        const canAdd = editableAndNotMachineOnly && (property.allowMultiple || !property.values || property.values.length === 0);
        const labelId = `label-${property.key}`;

        // The edit component should not actually allow editing the value if editable is set to false
        // or if the property contains settings that disallow editing existing values
        const disableEditing = !editable || LinkedDataProperty.disallowEditingOfExistingValues(property);
        const ValueComponent = disableEditing
            ? ValueComponentFactory.readOnlyComponent()
            : ValueComponentFactory.editComponent(property);

        return (
            <ListItem disableGutters style={{display: 'block'}}>
                <Typography variant="body1" component="label" id={labelId}>
                    {property.label}
                </Typography>
                {errors && errors.length > 0 ? errors.map(e => `${e} `) : null}
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

LinkedDataProperty.defaultProps = {
    onChange: () => {}
};

export default LinkedDataProperty;
