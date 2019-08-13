import React, {useContext} from 'react';
import PropTypes from 'prop-types';

import InputWithAddition from "./values/InputWithAddition";
import LinkedDataDropdown from "./LinkedDataDropdown";
import LinkedDataContext from "../LinkedDataContext";

const LinkedDataDropdownWithAddition = ({property, onChange, currentValues}) => {
    const {
        shapesPending, shapesError, determineShapeForTypes,
        requireIdentifier
    } = useContext(LinkedDataContext);

    const shape = (!shapesPending && !shapesError) ? determineShapeForTypes([property.className]) : {};

    return (
        <InputWithAddition
            shape={shape}
            type={property.className}
            error={shapesError}
            pending={shapesPending}
            onChange={onChange}
            requireIdentifier={requireIdentifier}
        >
            <LinkedDataDropdown
                property={property}
                currentValues={currentValues}
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
