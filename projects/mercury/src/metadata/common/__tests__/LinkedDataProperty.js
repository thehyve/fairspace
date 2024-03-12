/* eslint-disable jest/expect-expect */
import React from 'react';
import { MemoryRouter } from 'react-router-dom'; // use to render useRouter wrapped components
import { configure, mount, shallow } from 'enzyme';
import { render, screen } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import { ThemeProvider } from '@mui/material/styles';
import { STRING_URI } from '../../../constants';
import LinkedDataProperty from '../LinkedDataProperty';
import LinkedDataRelationTable from '../LinkedDataRelationTable';
import LinkedDataInputFieldsTable from '../LinkedDataInputFieldsTable';
import LinkedDataContext from '../../LinkedDataContext';
import NumberValue from '../values/NumberValue';
import SwitchValue from '../values/SwitchValue';
import ReferringValue from '../values/ReferringValue';
import theme from '../../../App.theme';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({ adapter: new Adapter() });

const defaultProperty = {
    key: 'description',
    datatype: STRING_URI,
    label: 'Description',
    maxValuesCount: 4,
    isEditable: true,
    isRelationShape: true,
};

const defaultValues = [{ value: 'More info' }, { value: 'My first collection' }, { value: 'My second collection' }];

describe('LinkedDataProperty elements', () => {
    it('shows a table with relations for relationShapes', () => {
        render(
            <ThemeProvider theme={theme}>
                <MemoryRouter>
                    <LinkedDataProperty property={defaultProperty} values={defaultValues} />
                </MemoryRouter>
            </ThemeProvider>,
        );

        const inputElements = screen.queryAllByRole('textbox');
        expect(inputElements).toHaveLength(1);
        expect(screen.queryByTestId('label-description')).not.toBeInTheDocument();
    });

    it('shows a table for input fields for non-relationShapes', () => {
        const property = {
            ...defaultProperty,
            isRelationShape: false,
        };

        render(
            <ThemeProvider theme={theme}>
                <LinkedDataProperty property={property} values={defaultValues} />
            </ThemeProvider>,
        );

        const inputElements = screen.queryAllByRole('textbox');
        expect(inputElements).toHaveLength(4);
        expect(screen.queryByTestId('label-description')).toBeInTheDocument();
    });

    describe('canEdit', () => {
        const verifyCanEdit = (property, expectedCanEdit) => {
            const wrapper = shallow(<LinkedDataProperty property={property} values={defaultValues} />);
            const table = wrapper.find(LinkedDataRelationTable);
            expect(table.length).toEqual(1);
            expect(table.prop('canEdit')).toBe(expectedCanEdit);
        };

        it('should allow adding new entities', () => verifyCanEdit(defaultProperty, true));
        it('should not allow adding new entities if property is not editable', () => verifyCanEdit({
            ...defaultProperty,
            isEditable: false,
        }, false));
        it('should not allow adding new entities if property is machineOnly', () => verifyCanEdit({
            ...defaultProperty,
            machineOnly: true,
        }, false));
    });

    describe('inputComponents', () => {
        const valueComponentFactory = {
            addComponent: () => NumberValue,
            editComponent: () => ReferringValue,
            readOnlyComponent: () => SwitchValue,
        };

        const renderTable = property => {
            const wrapper = mount(<ThemeProvider theme={theme}><LinkedDataContext.Provider value={{ valueComponentFactory }}><LinkedDataProperty property={property} /></LinkedDataContext.Provider></ThemeProvider>);
            const table = wrapper.find(LinkedDataInputFieldsTable);
            expect(table.length).toEqual(1);
            return table;
        };

        it('should use the factory in the context to determine the Add component', () => {
            expect(
                renderTable({
                    ...defaultProperty,
                    isRelationShape: false,
                }).prop('addComponent'),
            ).toEqual(NumberValue);
        });

        it('should use the factory in the context to determine the edit component', () => {
            expect(
                renderTable({
                    ...defaultProperty,
                    isRelationShape: false,
                }).prop('editComponent'),
            ).toEqual(ReferringValue);
        });

        it('should render a read-only component for non editable shapes', () => {
            expect(
                renderTable({
                    ...defaultProperty,
                    isRelationShape: false,
                    isEditable: false,
                }).prop('editComponent'),
            ).toEqual(SwitchValue);
        });

        it('should render a read-only component for machine only shapes', () => {
            expect(
                renderTable({
                    ...defaultProperty,
                    isRelationShape: false,
                    machineOnly: true,
                }).prop('editComponent'),
            ).toEqual(SwitchValue);
        });

        it('should render a read-only component for generic IRI resources', () => {
            expect(
                renderTable({
                    ...defaultProperty,
                    isRelationShape: false,
                    isGenericIriResource: true,
                }).prop('editComponent'),
            ).toEqual(SwitchValue);
        });

        it('should render a read-only component for controlled shapes', () => {
            expect(
                renderTable({
                    ...defaultProperty,
                    isRelationShape: false,
                    allowedValues: ['a'],
                }).prop('editComponent'),
            ).toEqual(SwitchValue);
        });
    });
});
