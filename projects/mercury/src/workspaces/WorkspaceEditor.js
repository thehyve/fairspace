import React from 'react';
import WorkspaceDialog from "./WorkspaceDialog";
import {useFormField} from "../common/hooks/UseFormField";
import LoadingOverlay from "../common/components/LoadingOverlay";

const ID_PATTERN = /^[a-z][-a-z_0-9]*$/;

export default ({onSubmit, onClose, creating, workspaces,
    workspace: {id = ''} = {}}) => {
    const isWorkspaceIdUnique = (workspaceId) => !workspaces.some(workspace => workspace.id === workspaceId);
    const idControl = useFormField(id, value => !!value && ID_PATTERN.test(value) && isWorkspaceIdUnique(value));

    const allControls = [idControl];

    const formValid = allControls.every(({valid}) => valid);

    const fields = [
        {
            control: idControl,
            required: true,
            id: "id",
            label: "Id",
            name: "id",
            helperText: "Value has to be unique per node. "
                + "Only lower case letters, numbers, hyphens and should start with a letter."
        }
    ];

    const validateAndSubmit = () => formValid && onSubmit(
        {
            id: idControl.value,
            label: idControl.value
        }
    );
    return (
        <>
            <WorkspaceDialog
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    validateAndSubmit();
                }}
                onClose={onClose}
                submitDisabled={Boolean(!formValid)}
                fields={fields}
            />
            <LoadingOverlay loading={creating} />
        </>
    );
};
