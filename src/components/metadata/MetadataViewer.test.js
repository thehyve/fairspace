import MetadataViewer from "./MetadataViewer"
import React from 'react';
import {mount} from "enzyme";
import mockStore from "../../store/mockStore"
import {Provider} from "react-redux";

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

it('displays properties properly', () => {
    const store = mockStore({})
    const wrapper = mount(<Provider store={store}><MetadataViewer properties={properties}/></Provider>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(7);
        expect(wrapper.text()).toEqual("DescriptionMore infoMy first collectionNameCollection 5TypeCollection");
    });
});


const properties = [
    {key: 'description', label: 'Description', values: [{index: 0, value: 'More info'}, {index: 1, value: 'My first collection'}]},
    {key: 'name', label: 'Name', values: [{index: 0, value: 'Collection 5'}]},
    {key: 'type', label: "Type", values: [{id: "http://fairspace.io/ontology#Collection", index: 0, label: "Collection"}]}
];
