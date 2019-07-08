import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import InputWithAddition from "./values/InputWithAddition";
import LinkedDataDropdown from "./LinkedDataDropdown";
import LinkedDataContext from "../LinkedDataContext";

const LinkedDataDropdownWithAddition = props => {
    const {shapesPending, shapesError, determineShapeForTypes, getEmptyLinkedData, createLinkedDataEntity, requireIdentifier} = useContext(LinkedDataContext);

    const shape = (!shapesPending && !shapesError) ? determineShapeForTypes([props.property.className]) : {};
    const emptyData = getEmptyLinkedData(shape);
    const onCreate = (formKey, _, subject) => {
        const type = props.property.className;
        return createLinkedDataEntity(formKey, subject, type);
    };

    return (
        <InputWithAddition
            shape={shape}
            emptyData={emptyData}
            onCreate={onCreate}
            error={shapesError}
            pending={shapesPending}
            onChange={props.onChange}
            requireIdentifier={requireIdentifier}
        >
            <LinkedDataDropdown
                property={props.property}
                onChange={props.onChange}
            />
        </InputWithAddition>
    );
};

LinkedDataDropdownWithAddition.propTypes = {
    property: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LinkedDataDropdownWithAddition;
