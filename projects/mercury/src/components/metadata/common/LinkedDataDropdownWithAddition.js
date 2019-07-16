import React, {useContext} from 'react';
import PropTypes from 'prop-types';

import InputWithAddition from "./values/InputWithAddition";
import LinkedDataDropdown from "./LinkedDataDropdown";
import LinkedDataContext from "../LinkedDataContext";

const LinkedDataDropdownWithAddition = ({property, onChange}) => {
    const {
        shapesPending, shapesError, determineShapeForTypes,
        getEmptyLinkedData, createLinkedDataEntity, requireIdentifier,
        onEntityCreationError,
    } = useContext(LinkedDataContext);

    const shape = (!shapesPending && !shapesError) ? determineShapeForTypes([property.className]) : {};
    const emptyData = getEmptyLinkedData(shape);

    const onCreate = (formKey, _, subject) => {
        const type = property.className;
        return createLinkedDataEntity(formKey, subject, type);
    };

    return (
        <InputWithAddition
            shape={shape}
            emptyData={emptyData}
            onCreate={onCreate}
            onEntityCreationError={onEntityCreationError}
            error={shapesError}
            pending={shapesPending}
            onChange={onChange}
            requireIdentifier={requireIdentifier}
        >
            <LinkedDataDropdown
                property={property}
                onChange={onChange}
            />
        </InputWithAddition>
    );
};

LinkedDataDropdownWithAddition.propTypes = {
    property: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LinkedDataDropdownWithAddition;
