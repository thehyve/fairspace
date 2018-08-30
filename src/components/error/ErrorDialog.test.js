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

it('shows error dialog when no subject provided', () => {
    const wrapper = mount(
        <ErrorDialog>
        <div className={"test"}>test</div>
        <div className={"test2"}>
                <Metadata subject={""} metadataStore={mockMetadataStore} />
        </div>
        </ErrorDialog>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const resultHeader = wrapper.find("h2");
        expect(resultHeader.text()).toEqual("report_problemAn error has occurred");
        const resultContent = wrapper.find("p");
        expect(resultContent.text()).toEqual("No subject given to retrieve metadata for");
    });
});
