import React from 'react';
import PropTypes from "prop-types";
import LinkedDataValuesTable from "./LinkedDataValuesTable";

const LinkedDataInputFieldsTable = ({
    property, values, validationErrors, onAdd, onChange, onDelete, canAdd,
    labelId, addComponent, editComponent: EditComponent, onMultiLineCtrlEnter, onBlur
}) => {
    // For input fields there is only a single input field
    const hasErrors = validationErrors && validationErrors.length > 0;

    // only add prop when needed to avoid warnings
    const multilineCtrlEnter = property.multiLine ? {onMultiLineCtrlEnter} : {};

    const columnDefinition = {
        id: property.key,
        label: '',
        getValue: (entry, idx) => (
            <EditComponent
                property={property}
                entry={entry}
                onChange={value => onChange(value, idx)}
                {...multilineCtrlEnter}
                onBlur={value => onBlur(value, idx)}
                aria-labelledby={labelId}
                error={hasErrors}
            />
        )
    };

    return (
        <LinkedDataValuesTable
            onAdd={onAdd}
            onDelete={onDelete}
            columnDefinitions={[columnDefinition]}
            property={property}
            values={values}
            showHeader={false}
            labelId={labelId}
            canAdd={canAdd}
            onBlur={onBlur}
            addComponent={addComponent}
        />
    );
};

LinkedDataInputFieldsTable.propTypes = {
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    property: PropTypes.object,
    labelId: PropTypes.string,
    addComponent: PropTypes.func
};

LinkedDataInputFieldsTable.defaultProps = {
    onChange: () => {},
    onDelete: () => {}
};

export default LinkedDataInputFieldsTable;
