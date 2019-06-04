import React, {useState, useContext} from 'react';
import PropTypes from "prop-types";
import {
    IconButton,
    FormControl,
    FormControlLabel,
    FormLabel,
    FormGroup,
    FormHelperText,
    Typography
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import {LinkedDataValuesContext} from "./LinkedDataValuesContext";

/**
     * Checks whether the configuration of this property disallowed editing of existing values
     * This is the case if
     *   - the property is machineOnly
     *   - the field refers to a url (marked as RESOURCE_URI)
     *   - the value is taken from a set of allowed values
     * @param property
     * @returns {Boolean}
     */
const disallowEditingOfExistingValues = ({machineOnly, isGenericIriResource, allowedValues}) => machineOnly
    || isGenericIriResource
    || allowedValues;

const LinkedDataProperty = ({property, onAdd, onChange, onDelete}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoveredAllProperty, setHoveredAllProperty] = useState(false);
    const {readOnlyComponent, editComponent, addComponent} = useContext(LinkedDataValuesContext);

    const {key, values, errors, maxValuesCount, machineOnly, minValuesCount, label, description, path} = property;
    const hasErrors = errors && errors.length > 0;

    // Do not show an add component if no multiples are allowed
    // and there is already a value
    const maxValuesReached = (maxValuesCount && (values.length >= maxValuesCount)) || false;
    const canAdd = property.isEditable && !machineOnly && !maxValuesReached;
    const labelId = `label-${key}`;

    // The edit component should not actually allow editing the value if editable is set to false
    // or if the property contains settings that disallow editing existing values
    const disableEditing = !property.isEditable || disallowEditingOfExistingValues(property);
    const ValueComponent = disableEditing ? readOnlyComponent() : editComponent(property);
    const ValueAddComponent = addComponent(property);
    const pathVisibility = hoveredAllProperty ? 'visible' : 'hidden';

    const isDeletable = entry => !('isDeletable' in entry) || entry.isDeletable;

    return (
        <FormControl
            onMouseEnter={() => setHoveredAllProperty(true)}
            onMouseLeave={() => setHoveredAllProperty(false)}
            required={minValuesCount > 0}
            error={hasErrors}
            component="fieldset"
            style={{
                width: '100%',
                margin: 4,
            }}
        >
            <FormLabel component="legend">
                {label}
            </FormLabel>
            <Typography variant="caption" color="textSecondary" style={{visibility: pathVisibility, textAlign: 'right'}}>
                {path}
            </Typography>
            <FormGroup>
                {values.map((entry, idx) => (
                    <div
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        // eslint-disable-next-line react/no-array-index-key
                        key={idx}
                    >
                        <FormControlLabel
                            style={{width: '100%', margin: 0}}
                            control={(
                                <>
                                    <ValueComponent
                                        property={property}
                                        entry={entry}
                                        onChange={(value) => onChange(value, idx)}
                                        aria-labelledby={labelId}
                                        error={hasErrors}
                                    />
                                    {
                                        isDeletable(entry) && property.isEditable
                                            ? (
                                                <IconButton
                                                    size="small"
                                                    aria-label="Delete"
                                                    title="Delete"
                                                    onClick={() => onDelete(idx)}
                                                    style={{
                                                        visibility: hoveredIndex === idx ? 'visible' : 'hidden',
                                                        padding: 6,
                                                        marginLeft: 8
                                                    }}
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                            ) : null
                                    }
                                </>
                            )}
                        />
                    </div>
                ))}

                {canAdd ? (
                    <FormControlLabel
                        style={{width: '100%', margin: 0}}
                        control={(
                            <div style={{width: '100%'}}>
                                <ValueAddComponent
                                    property={property}
                                    placeholder=""
                                    onChange={onAdd}
                                    aria-labelledby={labelId}
                                />
                            </div>

                        )}
                    />
                ) : null}

            </FormGroup>
            <FormHelperText color="primary">
                {hasErrors ? errors.map(e => `${e}. `) : null}
                {!hasErrors && hoveredAllProperty ? description : null}
            </FormHelperText>
        </FormControl>
    );
};

LinkedDataProperty.propTypes = {
    onChange: PropTypes.func,
    property: PropTypes.object,
};

LinkedDataProperty.defaultProps = {
    onChange: () => {}
};

export default LinkedDataProperty;
