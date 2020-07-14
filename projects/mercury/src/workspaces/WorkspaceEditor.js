import React from 'react';
import WorkspaceDialog from "./WorkspaceDialog";
import {useFormField} from "../common/hooks/UseFormField";
import LoadingOverlay from "../common/components/LoadingOverlay";

const ID_PATTERN = /^[a-z][-a-z_0-9]*$/;

export default ({onSubmit, onClose, creating, workspaces,
    workspace: {name = ''} = {}}) => {
    const isWorkspaceIdUnique = (workspaceId) => !workspaces.some(workspace => workspace.id === workspaceId);
    const nameControl = useFormField(name, value => !!value && ID_PATTERN.test(value) && isWorkspaceIdUnique(value));

    const allControls = [nameControl];

    const formValid = allControls.every(({valid}) => valid);

    const fields = [
        {
            control: nameControl,
            required: true,
            id: "name",
            label: "Name",
            name: "name",
            helperText: "Workspace name"
        }
    ];

    const validateAndSubmit = () => formValid && onSubmit(
        {
            name: nameControl.value,
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
