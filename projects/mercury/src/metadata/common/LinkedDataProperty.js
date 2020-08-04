import React, {useContext} from 'react';
import PropTypes from "prop-types";

import {FormControl, FormGroup, FormHelperText, FormLabel} from '@material-ui/core';
import LinkedDataInputFieldsTable from "./LinkedDataInputFieldsTable";
import LinkedDataRelationTable from "./LinkedDataRelationTable";
import {TOOLTIP_ENTER_DELAY} from "../../constants";
import GenericTooltip from "../../common/components/GenericTooltip";
import Iri from "../../common/components/Iri";
import LinkedDataContext from "../LinkedDataContext";
import UserContext from "../../users/UserContext";
import {isDataSteward} from "../../users/userUtils";

const LinkedDataProperty = (
    {formEditable = true, property, values = [], validationErrors = [], onAdd, onChange, onDelete, checkValueAddedNotSubmitted}
) => {
    const {valueComponentFactory} = useContext(LinkedDataContext);
    const {currentUser} = useContext(UserContext);

    const {key, maxValuesCount, machineOnly, minValuesCount, label, description, path} = property;
    const hasErrors = validationErrors && validationErrors.length > 0;

    // Do not show an add component if no multiples are allowed
    // and there is already a value
    const maxValuesReached = (maxValuesCount && (values.length >= maxValuesCount)) || false;
    const canAdd = formEditable && property.isEditable && !machineOnly && !maxValuesReached;
    const labelId = `label-${key}`;

    const isSingleValuePropertyWithExistingValue = (
        maxValuesCount === 1
            && values.length === 1 && values[0].value !== ""
            && !checkValueAddedNotSubmitted(property, values[0])
    );

    // Checks whether the configuration of this property disallow editing of existing values
    // This is the case if:
    // - the property is machineOnly
    // - the field refers to a url (marked as RESOURCE_URI)
    // - the value is taken from a set of allowed values
    // - single-value property already has a value and the current user does not have permission to modify existing values
    const disallowEditingOfExistingValues = (
        machineOnly
        || property.isGenericIriResource
        || property.allowedValues
        || (!isDataSteward(currentUser) && isSingleValuePropertyWithExistingValue)
    );

    // The edit component should not actually allow editing the value if editable is set to false
    // or if the property contains settings that disallow editing existing values
    const disableEditing = !formEditable || !property.isEditable || disallowEditingOfExistingValues;

    const editInputComponent = disableEditing ? valueComponentFactory.readOnlyComponent() : valueComponentFactory.editComponent(property);
    const addInputComponent = valueComponentFactory.addComponent(property);

    const labelTooltip = <><Iri iri={path} /><div style={{marginTop: 4}}>{description}</div></>;
    return (
        <FormControl
            required={formEditable && minValuesCount > 0}
            error={formEditable && hasErrors}
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
                            checkValueAddedNotSubmitted={checkValueAddedNotSubmitted}
                        />
                    ) : (
                        <LinkedDataInputFieldsTable
                            property={property}
                            values={values}
                            validationErrors={validationErrors}
                            canAdd={canAdd}
                            onAdd={onAdd}
                            onChange={onChange}
                            onDelete={onDelete}
                            labelId={labelId}
                            editComponent={editInputComponent}
                            addComponent={addInputComponent}
                            checkValueAddedNotSubmitted={checkValueAddedNotSubmitted}
                        />
                    )
                }
            </FormGroup>
            {formEditable && (
                hasErrors ? <FormHelperText color="primary">{validationErrors.map(e => `${e}. `)}</FormHelperText> : null
            )}
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
