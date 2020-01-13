import React from 'react';
import ProjectDialog from "./ProjectDialog";
import {useFormField} from "../common/hooks/UseFormField";
import {useAsync} from "../common/hooks";
import WorkspacesAPI from "./WorkspacesAPI";

const ID_PATTERN = /^[a-z]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export default ({onSubmit, onClose, isUpdate, projects,
                    project: {id = '', workspace = '', title = '', description = ''} = {}}) => {

    const workspaceControl = useFormField(workspace, value => !!value);

    const isProjectIdUnique = (id) => {
        return !projects.some(project => {return project.id === id && project.workspace === workspaceControl.value});
    };
    const idControl = useFormField(id, value => !!value && ID_PATTERN.test(value) && isProjectIdUnique(value));

    const titleControl = useFormField(title, value => !!value);
    const descriptionControl = useFormField(description, () => true);
    const allControls = [idControl, workspaceControl, titleControl, descriptionControl];

    const formValid = allControls.every(({valid}) => valid);

    const {data: workspaces = [], error, loading, refresh} = useAsync(WorkspacesAPI.getWorkspaces);

    const state = {
        editing: true
    };

    const fields = [
        {
            control: workspaceControl,
            required: true,
            autoFocus: true,
            id: "workspace",
            label: "Workspace",
            name: "workspace",
            select: true,
            selectOptions: workspaces.map(w => w.id),
        },
        {
            control: idControl,
            required: true,
            id: "id",
            label: "Id",
            name: "id",
            helperText: "Value has to be unique per workspace. " +
                "Only lower case letters, numbers, hyphens and should start with a letter."
        },
        {
            control: titleControl,
            required: true,
            id: "title",
            label: "Title",
            name: "title",
        },
        {
            control: descriptionControl,
            id: "description",
            label: "Description",
            name: "description",
            multiline: true
        }
    ];

    const validateAndSubmit = () => formValid && onSubmit(
        {
            workspace: workspaceControl.value,
            id: idControl.value,
            title: titleControl.value,
            description: descriptionControl.value
        }
    );

    return (
        <ProjectDialog
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                validateAndSubmit();
            }}
            onClose={onClose}
            submitDisabled={Boolean(!formValid)}
            fields={fields}
        />
    );

};
