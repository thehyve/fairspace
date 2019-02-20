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
let receivedLocation;

beforeEach(() => {
    collectionEditor = (
        <CollectionEditor
            editing
            title="title"
            name="name"
            description="description"
            type="S3_MOUNT"
            location="location"
            onClose={() => {
                cancelClicked = true;
            }}
            onSave={(name, description, location, type) => {
                receivedName = name;
                receivedDescription = description;
                receivedLocation = location;
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

    expect(wrapper.find(DialogTitle).at(0).childAt(0).text()).toEqual('title');

    const edit = wrapper.find(TextField);
    expect(edit.length).toEqual(3);
    expect(edit.at(0).prop('name')).toEqual('name');
    expect(edit.at(1).prop('name')).toEqual('description');
    expect(edit.at(2).prop('name')).toEqual('location');

    const buttons = wrapper.find(Button);
    expect(buttons.length).toEqual(2);
    expect(buttons.at(0).childAt(0).text()).toEqual('Cancel');
    expect(buttons.at(1).childAt(0).text()).toEqual('Save');

    const select = wrapper.find(Select);
    expect(select.length).toEqual(1);
    expect(select.at(0).prop('value')).toEqual('S3_MOUNT');

    cancelClicked = false;
    buttons.at(0).simulate('click');
    expect(cancelClicked).toEqual(true);

    buttons.at(1).simulate('click');
    expect(receivedName).toEqual('name');
    expect(receivedDescription).toEqual('description');
    expect(receivedLocation).toEqual('location');
    expect(receivedType).toEqual('S3_MOUNT');
});
