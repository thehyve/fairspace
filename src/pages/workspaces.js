import React from 'react';
import { List, Edit, Create, Datagrid, TextField, SimpleForm, DisabledInput, TextInput, EditButton} from 'react-admin';

export const WorkspaceList = (props) => (
    <List title="All workspaces" {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="namespace" />
            <EditButton />
        </Datagrid>
    </List>
);

const WorkspaceTitle = ({ record }) => {
    return <span>Workspace {record ? `"${record.name}"` : ''}</span>;
};

export const WorkspaceEdit = (props) => (
    <Edit title={<WorkspaceTitle />} {...props}>
        <SimpleForm>
            <DisabledInput source="id" />
            <TextInput source="name" />
            <TextInput source="namespace" />
        </SimpleForm>
    </Edit>
);

export const WorkspaceCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="namespace" />
        </SimpleForm>
    </Create>
);