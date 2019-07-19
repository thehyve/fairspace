import React, {useContext} from 'react';
import PropTypes from "prop-types";
import {FormControl, FormGroup, FormHelperText, FormLabel} from '@material-ui/core';
import LinkedDataInputFieldsTable from "./LinkedDataInputFieldsTable";
import LinkedDataRelationTable from "./LinkedDataRelationTable";
import {TOOLTIP_ENTER_DELAY} from "../../../constants";
import GenericTooltip from "../../common/GenericTooltip";
import Iri from "../../common/Iri";
import LinkedDataContext from "../LinkedDataContext";

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

const LinkedDataProperty = ({property, values = [], validations = [], onAdd, onChange, onDelete}) => {
    const {editorPath, valueComponentFactory} = useContext(LinkedDataContext);

    const {key, maxValuesCount, machineOnly, minValuesCount, label, description, path} = property;
    const hasErrors = validations && validations.length > 0;

    // Do not show an add component if no multiples are allowed
    // and there is already a value
    const maxValuesReached = (maxValuesCount && (values.length >= maxValuesCount)) || false;
    const canAdd = property.isEditable && !machineOnly && !maxValuesReached;
    const labelId = `label-${key}`;

    // The edit component should not actually allow editing the value if editable is set to false
    // or if the property contains settings that disallow editing existing values
    const disableEditing = !property.isEditable || disallowEditingOfExistingValues(property);
    const editInputComponent = disableEditing ? valueComponentFactory.readOnlyComponent() : valueComponentFactory.editComponent(property);
    const addInputComponent = valueComponentFactory.addComponent(property);

    const labelTooltip = <><Iri iri={path} /><div style={{marginTop: 4}}>{description}</div></>;

    return (
        <FormControl
            required={minValuesCount > 0}
            error={hasErrors}
            component="fieldset"
            style={{
                width: '100%',
                margin: 4,
            }}
        >
            <GenericTooltip interactive leaveDelay={100} title={labelTooltip} enterDelay={TOOLTIP_ENTER_DELAY}>
                <FormLabel component="legend">
                    {label}
                </FormLabel>
            </GenericTooltip>
            <FormGroup>
                {
                    property.isRelationShape ? (
                        <LinkedDataRelationTable
                            property={property}
                            values={values}
                            canAdd={canAdd}
                            onAdd={onAdd}
                            onDelete={onDelete}
                            addComponent={addInputComponent}
                            editorPath={editorPath}
                        />
                    ) : (
                        <LinkedDataInputFieldsTable
                            property={property}
                            values={values}
                            validations={validations}
                            canAdd={canAdd}
                            onAdd={onAdd}
                            onChange={onChange}
                            onDelete={onDelete}
                            labelId={labelId}
                            editComponent={editInputComponent}
                            addComponent={addInputComponent}
                        />
                    )
                }
            </FormGroup>
            {hasErrors ? <FormHelperText color="primary">{validations.map(e => `${e}. `)}</FormHelperText> : null}
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
