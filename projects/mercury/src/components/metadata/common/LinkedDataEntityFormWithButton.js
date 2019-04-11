import React from "react";
import PropTypes from "prop-types";
import LinkedDataEntityForm from "./LinkedDataEntityFormContainer";
import LinkedDataEntityButton from "./LinkedDataEntitySubmitButtonContainer";

const LinkedDataEntityFormWithButton = props => {
    const {editable, onSubmit, subject, ...otherProps} = props;
    return (
        <>
            <LinkedDataEntityForm editable={editable} subject={subject} {...otherProps} />
            {editable ? <LinkedDataEntityButton subject={subject} onClick={onSubmit} /> : null}
        </>
    );
};

LinkedDataEntityFormWithButton.propTypes = {
    editable: PropTypes.bool,
    subject: PropTypes.string,
    onSubmit: PropTypes.func.isRequired
};

export default LinkedDataEntityFormWithButton;
