import MetadataViewer from "./MetadataViewer"
import React from 'react';
import {mount} from "enzyme";

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

it('displays properties properly', () => {
    const wrapper = mount(<MetadataViewer properties={properties}/>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(7);
        expect(wrapper.text()).toEqual("DescriptionMore infoMy first collectionNameCollection 5TypeCollection");
    });
});


const properties = [
    {key: 'description', label: 'Description', values: [{value: 'More info'}, {value: 'My first collection'}]},
    {key: 'name', label: 'Name', values: [{value: 'Collection 5'}]},
    {key: 'type', label: "Type", values: [{id: "http://fairspace.io/ontology#Collection", label: "Collection"}]}
];
