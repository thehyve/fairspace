import React, {useState, useContext} from 'react';
import PropTypes from "prop-types";
import {
    IconButton,
    FormControl,
    FormControlLabel,
    FormLabel,
    FormGroup,
    FormHelperText,
    Grid,
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
const disallowEditingOfExistingValues = (property) => property.machineOnly
    || property.isGenericIriResource
    || property.allowedValues;

const LinkedDataProperty = ({property, editable, onAdd, onChange, onDelete}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoveredAllProperty, setHoveredAllProperty] = useState(false);
    const {readOnlyComponent, editComponent, addComponent} = useContext(LinkedDataValuesContext);

    const {key, values, errors, maxValuesCount, machineOnly, minValuesCount, label, description, path} = property;
    const hasErrors = errors && errors.length > 0;

    // Do not show an add component if no multiples are allowed
    // and there is already a value
    const maxValuesReached = (maxValuesCount && (values.length >= maxValuesCount)) || false;
    const canAdd = editable && !machineOnly && !maxValuesReached;
    const labelId = `label-${key}`;

    // The edit component should not actually allow editing the value if editable is set to false
    // or if the property contains settings that disallow editing existing values
    const disableEditing = !editable || disallowEditingOfExistingValues(property);
    const ValueComponent = disableEditing ? readOnlyComponent() : editComponent(property);
    const ValueAddComponent = addComponent(property);

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
            <Grid container justify="space-between">
                <Grid item>
                    <FormLabel component="legend">{label}</FormLabel>
                </Grid>
                <Grid item>
                    <Typography color="primary" variant="caption" style={{visibility: hoveredAllProperty ? 'visible' : 'hidden'}}>
                        {path}
                    </Typography>
                </Grid>
            </Grid>
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
                                        editable
                                            ? (
                                                <IconButton
                                                    size="small"
                                                    aria-label="Delete"
                                                    title="Delete"
                                                    onClick={() => onDelete(idx)}
                                                    style={{visibility: hoveredIndex === idx ? 'visible' : 'hidden'}}
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
    editable: PropTypes.bool,
    property: PropTypes.object,
};

LinkedDataProperty.defaultProps = {
    onChange: () => {},
    editable: true
};

export default LinkedDataProperty;
