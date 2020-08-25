import React from 'react';
import WorkspaceDialog from "./WorkspaceDialog";
import {useFormField} from "../common/hooks/UseFormField";
import LoadingOverlay from "../common/components/LoadingOverlay";

export default ({onSubmit, onClose, creating, workspaces, title,
    workspace: {name = ''} = {}}) => {
    const isWorkspaceNameUnique = (workspaceName) => !workspaces.some(workspace => workspace.name === workspaceName);
    const nameControl = useFormField(name, value => !!value && isWorkspaceNameUnique(value));

    const allControls = [nameControl];

    const formValid = allControls.every(({valid}) => valid);

    const fields = [
        {
            control: nameControl,
            required: true,
            id: "name",
            label: "Name",
            name: "name",
            helperText: "Workspace name. Has to be unique."
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
                title={title}
            />
            <LoadingOverlay loading={creating} />
        </>
    );
};
