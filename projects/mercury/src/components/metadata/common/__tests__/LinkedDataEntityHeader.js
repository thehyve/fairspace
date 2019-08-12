import React from 'react';
import {shallow} from "enzyme";
import {LinkedDataEntityHeader} from "../LinkedDataEntityHeader";
import DeleteEntityButton from "../DeleteEntityButton";
import {CREATED_BY_URI, DATE_DELETED_URI, DELETED_BY_URI, FIXED_SHAPE_URI} from "../../../../constants";

describe('LinkedDataEntityHeader', () => {
    const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';

    describe('delete button', () => {
        it('should show a delete button for regular entities', () => {
            const values = {
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}]
            };

            const wrapper = shallow(<LinkedDataEntityHeader
                subject={subject}
                values={values}
            />);

            const button = wrapper.find(DeleteEntityButton);
            expect(button.length).toBe(1);
            expect(button.prop("isDeletable")).toBe(true);
        });

        it('should show a disabled button for fixed shapes', () => {
            const values = {
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}],
                [FIXED_SHAPE_URI]: [{value: true}]
            };

            const wrapper = shallow(<LinkedDataEntityHeader
                subject={subject}
                values={values}
            />);

            const button = wrapper.find(DeleteEntityButton);
            expect(button.length).toBe(1);
            expect(button.prop("isDeletable")).toBe(false);
        });

        it('should not show a delete button for deleted entities', () => {
            const values = {
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}],
                [DELETED_BY_URI]: [{id: 'http://some-person', label: 'John'}],
                [DATE_DELETED_URI]: [{value: '2000-01-01'}]
            };

            const wrapper = shallow(<LinkedDataEntityHeader
                subject={subject}
                values={values}
            />);

            const button = wrapper.find(DeleteEntityButton);
            expect(button.length).toBe(0);
        });
    });
});
