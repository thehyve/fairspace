import React, {useContext} from 'react';
import PropTypes from 'prop-types';

import InputWithAddition from "./values/InputWithAddition";
import LinkedDataDropdown from "./LinkedDataDropdown";
import LinkedDataContext from "../LinkedDataContext";

const LinkedDataDropdownWithAddition = ({property, onChange}) => {
    const {
        shapesPending, shapesError, determineShapeForTypes,
        getEmptyLinkedData, requireIdentifier,
        onEntityCreationError,
    } = useContext(LinkedDataContext);

    const shape = (!shapesPending && !shapesError) ? determineShapeForTypes([property.className]) : {};
    const emptyData = getEmptyLinkedData(shape);

    return (
        <InputWithAddition
            shape={shape}
            type={property.className}
            emptyData={emptyData}
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
