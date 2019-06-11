import React, {useContext, useState} from 'react';
import PropTypes from "prop-types";
import {FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Typography} from '@material-ui/core';

import {LinkedDataValuesContext} from "./LinkedDataValuesContext";
import LinkedDataPropertyValuesList from "./LinkedDataPropertyValuesList";
import LinkedDataPropertyValuesTable from "./LinkedDataPropertyValuesTable";

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
                {
                    property.isRelationShape ? (
                        <LinkedDataPropertyValuesTable
                            property={property}
                            onDelete={onDelete}
                        />
                    ) : (
                        <LinkedDataPropertyValuesList
                            property={property}
                            onChange={onChange}
                            onDelete={onDelete}
                            labelId={labelId}
                            valueComponent={ValueComponent}
                        />
                    )
                }

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
