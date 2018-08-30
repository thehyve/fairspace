import React from 'react';
import {mount} from "enzyme";
import ErrorDialog from "../error/ErrorDialog";
import Metadata from "../metadata/Metadata";

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

let mockMetadataStore;

beforeEach(() => {
    mockMetadataStore = {
        getVocabulary: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve())
    }
});

it('shows error when no subject provided', () => {
    const wrapper = mount(<ErrorDialog><Metadata subject={""} metadataStore={mockMetadataStore} /></ErrorDialog>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(0);
        expect(wrapper.text()).toEqual("No subject given to retrieve metadata for");
    });
});
