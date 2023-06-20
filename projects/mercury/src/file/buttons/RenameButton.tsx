import React, {useState} from 'react';
import PropTypes from 'prop-types';
import useIsMounted from "react-is-mounted-hook";
import {useFormField} from "../../common/hooks/UseFormField";
import {isValidFileName} from "../fileUtils";
import FileNameDialog from "./FileNameDialog";

const RenameButton = ({disabled, currentName, onRename, children}) => {
    const [opened, setOpened] = useState(false);
    const isMounted = useIsMounted();

    const nameControl = useFormField('', value => (
        !!value && isValidFileName(value)
    ));

    const openDialog = (e) => {
        if (e) e.stopPropagation();
        nameControl.setValue(currentName);
        if (!disabled) {
            setOpened(true);
        }
    };

    const closeDialog = e => {
        if (e) e.stopPropagation();
        setOpened(false);
    };

    const handleRename = () => {
        onRename(nameControl.value)
            .then(shouldClose => isMounted() && shouldClose && setOpened(false));
    };

    const validateAndRename = () => nameControl.valid && handleRename();

    const dialog = opened ? (
        <FileNameDialog
            onClose={closeDialog}
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                validateAndRename();
            }}
            submitDisabled={Boolean(!nameControl.valid)}
            title={`Rename ${currentName}`}
            control={nameControl}
        />
    ) : null;

    return (
        <>
            <span onClick={openDialog}>
                {children}
            </span>
            {dialog}
        </>
    );
};

RenameButton.propTypes = {
    onRename: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

RenameButton.defaultProps = {
    disabled: false
};

export default RenameButton;
