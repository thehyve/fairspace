// @ts-nocheck
// @ts-nocheck
import React, { useState } from "react";
import PropTypes from "prop-types";
import ConfirmationDialog from "./ConfirmationDialog";

const ConfirmationButton = ({
  children,
  message,
  disabled,
  onClick,
  ...otherProps
}) => {
  const [isDialogOpen, showDialog] = useState(false);

  const agree = () => {
    showDialog(false);
    onClick();
  };

  const dialog = isDialogOpen && !disabled ? <ConfirmationDialog open title="Confirmation" content={message} onAgree={agree} onDisagree={() => showDialog(false)} {...otherProps} /> : null;
  return <>
            <span onClick={() => !disabled && showDialog(true)}>
                {children}
            </span>
            {dialog}
        </>;
};

ConfirmationButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  message: PropTypes.any.isRequired,
  disabled: PropTypes.bool
};
ConfirmationButton.defaultProps = {
  disabled: false
};
export default ConfirmationButton;