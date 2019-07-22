import React from 'react';
import PropTypes from "prop-types";
import LinkedDataValuesTable from "./LinkedDataValuesTable";

const LinkedDataInputFieldsTable = ({property, values, validationErrors, onAdd, onChange, onDelete, canAdd, labelId, addComponent, editComponent: EditComponent}) => {
    // For input fields there is only a single input field
    const hasErrors = validationErrors && validationErrors.length > 0;

    const columnDefinition = {
        id: property.key,
        label: '',
        getValue: (entry, idx) => (
            <EditComponent
                property={property}
                entry={entry}
                onChange={value => onChange(value, idx)}
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
