import React from 'react';
import ProjectDialog from "./ProjectDialog";
import {useFormField} from "../common/hooks/UseFormField";
import {useAsync} from "../common/hooks";
import NodesAPI from "./NodesAPI";
import {LoadingOverlay} from "../common/components";

const ID_PATTERN = /^[a-z][-a-z_0-9]*$/;

export default ({onSubmit, onClose, creating, projects, getNodes = NodesAPI.getNodes,
    project: {id = '', node = ''} = {}}) => {
    const {data: nodes = [], loading} = useAsync(getNodes);

    const nodeControl = useFormField(node, value => !!value);

    const isProjectIdUnique = (projectId) => !projects.some(project => project.id === projectId);
    const idControl = useFormField(id, value => !!value && ID_PATTERN.test(value) && isProjectIdUnique(value));

    const allControls = [idControl, nodeControl];

    const formValid = allControls.every(({valid}) => valid);

    const defaultNode = (nodes.length === 1) && nodes[0];
    if (defaultNode && (defaultNode.id !== nodeControl.value)) {
        nodeControl.setValue(defaultNode.id);
    }

    const fields = [
        {
            control: nodeControl,
            required: true,
            autoFocus: true,
            id: "node",
            label: "Node",
            name: "node",
            select: true,
            selectOptions: nodes.map(w => w.id)
        },
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
            node: nodeControl.value,
            id: idControl.value,
            label: idControl.value
        }
    );

    if (loading) {
        return (
            <LoadingOverlay loading />
        );
    }
    return (
        <>
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
            <LoadingOverlay loading={creating} />
        </>
    );
};
