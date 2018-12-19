import ReactDOM from "react-dom";
import React from "react";
import Button from "@material-ui/core/Button/Button";
import {shallow} from "enzyme";
import {DialogTitle, Select, TextField} from "@material-ui/core";
import CollectionEditor from "./CollectionEditor";

let collectionEditor;
let cancelClicked;
let receivedName;
let receivedDescription;
let receivedType;

beforeEach(() => {
    collectionEditor = (
        <CollectionEditor
            editing
            title="title"
            name="name"
            description="description"
            type="S3_MOUNT"
            onCancel={() => {
                cancelClicked = true;
            }}
            onSave={(name, description, type) => {
                receivedName = name;
                receivedDescription = description;
                receivedType = type;
            }}
            editType
        />
    );

    cancelClicked = false;
    receivedName = receivedDescription = receivedType = '';
});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(collectionEditor, div);
    ReactDOM.unmountComponentAtNode(div);
});


it('applies properties properly', () => {
    const wrapper = shallow(collectionEditor);
    wrapper.instance().componentDidUpdate();

    expect(wrapper.find(DialogTitle).at(0).childAt(0).text()).toEqual('title');

    const edit = wrapper.find(TextField);
    expect(edit.length).toEqual(2);
    expect(edit.at(0).prop('value')).toEqual('name');
    expect(edit.at(1).prop('value')).toEqual('description');

    const button = wrapper.find(Button);
    expect(button.length).toEqual(2);
    expect(button.at(0).childAt(0).text()).toEqual('Cancel');
    expect(button.at(1).childAt(0).text()).toEqual('Save');

    const select = wrapper.find(Select);
    expect(select.length).toEqual(1);
    expect(select.at(0).prop('value')).toEqual('S3_MOUNT');

    cancelClicked = false;
    button.at(0).simulate('click');
    expect(cancelClicked).toEqual(true);

    button.at(1).simulate('click');
    expect(receivedName).toEqual('name');
    expect(receivedDescription).toEqual('description');
    expect(receivedType).toEqual('S3_MOUNT');
});
