import React, {useState} from 'react';
import useIsMounted from "react-is-mounted-hook";
import FileNameDialog from "./FileNameDialog";
import {useFormField} from "../../common/hooks/UseFormField";
import {isValidFileName} from "../fileUtils";

const CreateDirectoryButton = ({children, disabled, onCreate}) => {
    const [opened, setOpened] = useState(false);
    const isMounted = useIsMounted();

    const nameControl = useFormField('', value => (
        !!value && isValidFileName(value)
    ));
    const openDialog = (e) => {
        if (e) e.stopPropagation();
        nameControl.setValue('');
        setOpened(true);
    };

    const closeDialog = (e) => {
        if (e) e.stopPropagation();
        setOpened(false);
    };

    const createDirectory = () => {
        onCreate(nameControl.value)
            .then(shouldClose => isMounted() && shouldClose && closeDialog());
    };

    const validateAndCreate = () => nameControl.valid && createDirectory();

    return (
        <>
            <span style={{display: 'inherit'}} onClick={e => !disabled && openDialog(e)}>
                {children}
            </span>
            {opened ? (
                <FileNameDialog
                    onClose={closeDialog}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        validateAndCreate();
                    }}
                    submitDisabled={Boolean(!nameControl.valid)}
                    title="Create new directory"
                    control={nameControl}
                />
            ) : null}
        </>
    );
};

export default CreateDirectoryButton;
