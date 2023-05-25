import React, {useContext} from 'react';
import PropTypes from "prop-types";

import {FormControl, FormGroup, FormHelperText, FormLabel} from '@mui/material';
import LinkedDataInputFieldsTable from "./LinkedDataInputFieldsTable";
import LinkedDataRelationTable from "./LinkedDataRelationTable";
import {LABEL_URI, TOOLTIP_ENTER_DELAY} from "../../constants";
import GenericTooltip from "../../common/components/GenericTooltip";
import Iri from "../../common/components/Iri";
import LinkedDataContext from "../LinkedDataContext";

const LinkedDataProperty = (
    {formEditable = true, property, values = [], validationErrors = [], onAdd, onChange, onDelete}
) => {
    const {editorPath, valueComponentFactory} = useContext(LinkedDataContext);

    const {key, machineOnly, minValuesCount, label, description, path} = property;
    const hasErrors = validationErrors && validationErrors.length > 0;

    // Do not show an add component if no multiples are allowed
    // and there is already a value
    const canEdit = formEditable && property.isEditable && !machineOnly;
    const labelId = `label-${key}`;

    // Checks whether the configuration of this property disallow editing of existing values
    // This is the case if:
    // - the property is machineOnly
    // - the field refers to a url (marked as RESOURCE_URI)
    // - the value is taken from a set of allowed values
    const disallowEditingOfExistingValues = (
        machineOnly
        || property.isGenericIriResource
        || property.allowedValues
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
            {
                canEdit || key !== LABEL_URI
                    ? (
                        <GenericTooltip interactive leaveDelay={100} title={labelTooltip} enterDelay={TOOLTIP_ENTER_DELAY}>
                            <FormLabel component="legend">
                                {label} {values.length > 1 && "(" + values.length + ")"}
                            </FormLabel>
                        </GenericTooltip>
                    ) : null
            }
            <FormGroup>
                {
                    property.isRelationShape ? (
                        <LinkedDataRelationTable
                            property={property}
                            values={values}
                            canEdit={canEdit}
                            onAdd={onAdd}
                            onDelete={onDelete}
                            addComponent={addInputComponent}
                            editorPath={editorPath}
                        />
                    ) : (
                        <LinkedDataInputFieldsTable
                            property={property}
                            values={values}
                            validationErrors={validationErrors}
                            canEdit={canEdit}
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
