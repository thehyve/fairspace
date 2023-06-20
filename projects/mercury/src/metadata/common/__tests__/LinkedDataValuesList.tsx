// @ts-nocheck
import {render} from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import {STRING_URI} from "../../../constants";
import {LinkedDataValuesList} from "../LinkedDataValuesList";
import StringValue from "../values/StringValue";
const defaultProperty = {
    key: 'description',
    datatype: STRING_URI,
    label: 'Description',
    maxValuesCount: 4,
    isEditable: true
};
const columnDefinition = {
    id: defaultProperty.key,
    label: 'Test column',
    getValue: entry => entry.value
};
const defaultValues = [{
    value: 'More info'
}, {
    value: 'My first collection'
}, {
    value: 'My second collection'
}];
describe('LinkedDataValuesList', () => {
    it('should render the title and values as specified', () => {
        const {
            queryByText
        } = render(<LinkedDataValuesList columnDefinition={columnDefinition} property={defaultProperty} values={defaultValues} />);
        expect(queryByText('Test column')).toBeInTheDocument();
        expect(queryByText('More info')).toBeInTheDocument();
        expect(queryByText('My first collection')).toBeInTheDocument();
        expect(queryByText('My second collection')).toBeInTheDocument();
    });
    it('should hide the header if requested', () => {
        const {
            queryAllByText
        } = render(<LinkedDataValuesList showHeader={false} columnDefinition={columnDefinition} property={defaultProperty} values={defaultValues} />);
        expect(queryAllByText('Test column').length).toBe(0);
    });
    it('should show a delete button for editable properties', () => {
        const property = {...defaultProperty,
            isEditable: true};
        const {
            queryAllByTestId
        } = render(<LinkedDataValuesList currentUser={{
            admin: true
        }} columnDefinition={columnDefinition} property={property} values={defaultValues} />);
        expect(queryAllByTestId('delete-btn').length).toBe(3);
    });
    it('should show an add input field when adding is allowed', () => {
        const {
            queryAllByTestId
        } = render(<LinkedDataValuesList canAdd addComponent={StringValue} columnDefinition={columnDefinition} property={defaultProperty} values={defaultValues} />);
        expect(queryAllByTestId('add-value-input').length).toBe(1);
    });
    it('should not show an add input field when maxValueCount reached', () => {
        const property = {...defaultProperty,
            maxValuesCount: 3};
        const {
            queryAllByTestId
        } = render(<LinkedDataValuesList canAdd addComponent={StringValue} columnDefinition={columnDefinition} property={property} values={defaultValues} />);
        expect(queryAllByTestId('add-value-input').length).toBe(0);
    });
});