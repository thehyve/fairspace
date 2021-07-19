import React from 'react';
import WorkspaceDialog from "./WorkspaceDialog";
import {useFormField} from "../common/hooks/UseFormField";
import LoadingOverlay from "../common/components/LoadingOverlay";

export default ({onSubmit, onClose, creating, workspaces, title,
    workspace: {name = ''} = {}}) => {
    const isWorkspaceNameUnique = (workspaceName) => !workspaces.some(workspace => workspace.name === workspaceName);
    const nameControl = useFormField(name, value => !!value && !!value.trim() && isWorkspaceNameUnique(value.trim()));

    const nameField = {
        control: nameControl,
        autoFocus: true,
        required: true,
        id: "name",
        label: "Code",
        name: "name",
        helperText: "Workspace code. Has to be unique. "
            + "It will prefix all collections of the workspace - preferred length is maximum 10 characters"
    };

    const validateAndSubmit = () => nameControl.valid && onSubmit(
        {
            name: nameControl.value.trim(),
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
                submitDisabled={Boolean(!nameControl.valid)}
                fields={[nameField]}
                title={title}
            />
            <LoadingOverlay loading={creating} />
        </>
    );
};
